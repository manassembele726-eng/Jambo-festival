import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db, hashPassword, verifyPassword, StoredUser } from './server/db';
import { 
  generateToken, 
  requireAuth, 
  requireRole, 
  AuthenticatedRequest, 
  verifyToken 
} from './server/auth';
import { 
  TicketPricingTier, 
  FestivalEvent, 
  NewsArticle, 
  GalleryAlbum, 
  SiteSettings, 
  ContactMessage, 
  MediaFile,
  Ticket
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// High body limit for image uploads (base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded media
const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Lazy Gemini API Client initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// 1. HEALTH CHECK
// ----------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'persistent_json_ready'
  });
});

// ----------------------------------------------------
// 2. AUTHENTICATION & PROFILE
// ----------------------------------------------------

// Admin Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Veuillez saisir votre email et votre mot de passe.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.get().users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || !user.active) {
    return res.status(401).json({ error: 'Identifiants incorrects ou compte inactif.' });
  }

  const isMatch = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isMatch) {
    return res.status(401).json({ error: 'Identifiants incorrects. Veuillez vérifier vos accès.' });
  }

  // Update lastLoginAt
  const now = new Date().toISOString();
  db.update(d => {
    const u = d.users.find(x => x.id === user.id);
    if (u) u.lastLoginAt = now;
  });

  const { passwordHash, passwordSalt, ...safeUser } = user;
  safeUser.lastLoginAt = now;

  const token = generateToken(safeUser);

  db.addAuditLog({
    userId: safeUser.id,
    userName: `${safeUser.firstName} ${safeUser.lastName}`,
    userRole: safeUser.role,
    action: 'CONNEXION',
    entity: 'AUTH',
    entityId: safeUser.id,
    details: `Connexion réussie de ${safeUser.firstName} ${safeUser.lastName} (${safeUser.role})`,
  });

  res.json({
    success: true,
    token,
    user: safeUser,
  });
});

// Get Current User (Token Validation)
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Update Profile
app.post('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { firstName, lastName, phone, avatarUrl, email } = req.body;
  const userId = req.user!.id;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Nom et prénom requis.' });
  }

  let updatedUser: any = null;

  db.update(d => {
    const u = d.users.find(x => x.id === userId);
    if (u) {
      u.firstName = firstName.trim();
      u.lastName = lastName.trim();
      if (phone !== undefined) u.phone = phone;
      if (avatarUrl !== undefined) u.avatarUrl = avatarUrl;
      if (email && email.includes('@')) u.email = email.trim().toLowerCase();
      const { passwordHash, passwordSalt, ...safe } = u;
      updatedUser = safe;
    }
  });

  if (!updatedUser) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'PROFIL_MODIFIÉ',
    entity: 'PROFILE',
    entityId: userId,
    details: `Mise à jour des informations personnelles du profil`,
  });

  res.json({ success: true, user: updatedUser });
});

// Change Password
app.post('/api/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
  }

  const storedUser = db.get().users.find(u => u.id === userId);
  if (!storedUser) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const isCurrentValid = verifyPassword(currentPassword, storedUser.passwordHash, storedUser.passwordSalt);
  if (!isCurrentValid) {
    return res.status(400).json({ error: 'L\'ancien mot de passe saisi est incorrect.' });
  }

  const { hash, salt } = hashPassword(newPassword);

  db.update(d => {
    const u = d.users.find(x => x.id === userId);
    if (u) {
      u.passwordHash = hash;
      u.passwordSalt = salt;
    }
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'MOT_DE_PASSE_MODIFIÉ',
    entity: 'SECURITY',
    entityId: userId,
    details: `Changement de mot de passe sécurisé effectué avec succès`,
  });

  res.json({ success: true, message: 'Mot de passe modifié avec succès.' });
});

// Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requis.' });
  }

  const user = db.get().users.find(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user) {
    // Return friendly generic response for security
    return res.json({ 
      success: true, 
      message: 'Si cette adresse correspond à un compte administrateur, un lien de réinitialisation sécurisé a été généré.' 
    });
  }

  // Generate temporary recovery code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  db.addAuditLog({
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    userRole: user.role,
    action: 'DEMANDE_RÉINITIALISATION',
    entity: 'SECURITY',
    entityId: user.id,
    details: `Demande de réinitialisation de mot de passe pour ${user.email} (Code généré : ${resetCode})`,
  });

  res.json({
    success: true,
    message: `Une procédure de réinitialisation a été initiée. Pour l'environnement officiel, utilisez le code temporaire sécurisé : ${resetCode}`,
    tempCode: resetCode,
  });
});

// ----------------------------------------------------
// 3. USER MANAGEMENT (SUPER_ADMIN ONLY)
// ----------------------------------------------------

// List all admin users
app.get('/api/users', requireAuth, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const safeUsers = db.get().users.map(({ passwordHash, passwordSalt, ...safe }) => safe);
  res.json({ users: safeUsers });
});

// Create new admin user
app.post('/api/users', requireAuth, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { email, firstName, lastName, password, role, phone } = req.body;

  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être renseignés.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const existing = db.get().users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'Un compte avec cette adresse email existe déjà.' });
  }

  const { hash, salt } = hashPassword(password);
  const newUser: StoredUser = {
    id: `USR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    email: cleanEmail,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
    phone: phone || '',
    active: true,
    createdAt: new Date().toISOString(),
    passwordHash: hash,
    passwordSalt: salt,
  };

  db.update(d => {
    d.users.push(newUser);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'CRÉATION_UTILISATEUR',
    entity: 'USERS',
    entityId: newUser.id,
    details: `Création du compte administrateur ${newUser.firstName} ${newUser.lastName} (${newUser.role})`,
  });

  const { passwordHash, passwordSalt, ...safe } = newUser;
  res.json({ success: true, user: safe });
});

// Update admin user
app.put('/api/users/:id', requireAuth, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, role, active, phone, password } = req.body;

  let updatedUser: any = null;

  db.update(d => {
    const u = d.users.find(x => x.id === id);
    if (u) {
      if (firstName) u.firstName = firstName.trim();
      if (lastName) u.lastName = lastName.trim();
      if (role) u.role = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
      if (active !== undefined) u.active = Boolean(active);
      if (phone !== undefined) u.phone = phone;
      if (password && password.length >= 6) {
        const { hash, salt } = hashPassword(password);
        u.passwordHash = hash;
        u.passwordSalt = salt;
      }
      const { passwordHash, passwordSalt, ...safe } = u;
      updatedUser = safe;
    }
  });

  if (!updatedUser) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'MODIFICATION_UTILISATEUR',
    entity: 'USERS',
    entityId: id,
    details: `Modification des droits ou statut de ${updatedUser.firstName} ${updatedUser.lastName}`,
  });

  res.json({ success: true, user: updatedUser });
});

// Delete admin user
app.delete('/api/users/:id', requireAuth, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (id === req.user!.id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
  }

  const target = db.get().users.find(u => u.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  db.update(d => {
    d.users = d.users.filter(u => u.id !== id);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'SUPPRESSION_UTILISATEUR',
    entity: 'USERS',
    entityId: id,
    details: `Suppression du compte administrateur ${target.firstName} ${target.lastName}`,
  });

  res.json({ success: true, message: 'Utilisateur supprimé.' });
});

// ----------------------------------------------------
// 4. MEDIA LIBRARY & UPLOAD
// ----------------------------------------------------

// Upload Image (Base64 dataURL or JSON)
app.post('/api/media/upload', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { base64Data, filename, originalName } = req.body;

  if (!base64Data) {
    return res.status(400).json({ error: 'Données d\'image manquantes.' });
  }

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Format d\'image base64 invalide.' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    // Determine extension
    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';

    const safeName = `media_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const mediaItem: MediaFile = {
      id: `MED-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      filename: safeName,
      originalName: originalName || filename || safeName,
      mimeType,
      size: buffer.length,
      url: `/uploads/${safeName}`,
      thumbnailUrl: `/uploads/${safeName}`,
      uploadedBy: `${req.user!.firstName} ${req.user!.lastName}`,
      createdAt: new Date().toISOString(),
    };

    db.update(d => {
      d.mediaFiles = [mediaItem, ...(d.mediaFiles || [])];
    });

    db.addAuditLog({
      userId: req.user!.id,
      userName: `${req.user!.firstName} ${req.user!.lastName}`,
      userRole: req.user!.role,
      action: 'AJOUT_MÉDIA',
      entity: 'MEDIA',
      entityId: mediaItem.id,
      details: `Téléversement de l'image ${mediaItem.originalName} (${Math.round(mediaItem.size / 1024)} Ko)`,
    });

    res.json({ success: true, media: mediaItem });
  } catch (err: any) {
    console.error('Error uploading media:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'image.' });
  }
});

// List Media
app.get('/api/media', (req: Request, res: Response) => {
  res.json({ media: db.get().mediaFiles || [] });
});

// Delete Media
app.delete('/api/media/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const media = db.get().mediaFiles.find(m => m.id === id);

  if (media) {
    try {
      const filePath = path.join(uploadsDir, media.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('File delete error:', e);
    }

    db.update(d => {
      d.mediaFiles = d.mediaFiles.filter(m => m.id !== id);
    });

    db.addAuditLog({
      userId: req.user!.id,
      userName: `${req.user!.firstName} ${req.user!.lastName}`,
      userRole: req.user!.role,
      action: 'SUPPRESSION_MÉDIA',
      entity: 'MEDIA',
      entityId: id,
      details: `Suppression de l'image ${media.originalName}`,
    });
  }

  res.json({ success: true });
});

// ----------------------------------------------------
// 5. SITE SETTINGS & CONTENT
// ----------------------------------------------------

// Get Settings (Public)
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ settings: db.get().settings });
});

// Update Settings (Auth)
app.put('/api/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const newSettings = req.body;
  
  db.update(d => {
    d.settings = { ...d.settings, ...newSettings };
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'PARAMÈTRES_MODIFIÉS',
    entity: 'SETTINGS',
    details: `Mise à jour des paramètres généraux, contact ou SEO du site`,
  });

  res.json({ success: true, settings: db.get().settings });
});

// Get Dynamic Content (Public)
app.get('/api/content', (req: Request, res: Response) => {
  res.json({ content: db.get().content });
});

// Update Dynamic Content (Auth)
app.put('/api/content', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const newContent = req.body;

  db.update(d => {
    d.content = { ...d.content, ...newContent };
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'CONTENU_MODIFIÉ',
    entity: 'CONTENT',
    details: `Modification des textes et descriptions du site public`,
  });

  res.json({ success: true, content: db.get().content });
});

// ----------------------------------------------------
// 6. TICKETS & PRICING MANAGEMENT
// ----------------------------------------------------

// Get Pricing Tiers (Public)
app.get('/api/tickets/pricing', (req: Request, res: Response) => {
  res.json({ tiers: db.get().pricingTiers });
});

// Create Pricing Tier
app.post('/api/tickets/pricing', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const tier: TicketPricingTier = {
    id: `TIER-${Date.now()}`,
    ...req.body,
  };

  db.update(d => {
    d.pricingTiers.push(tier);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'CRÉATION_TARIF',
    entity: 'PRICING',
    entityId: tier.id,
    details: `Création du pass tarifaire ${tier.name} (${tier.price} ${tier.currency})`,
  });

  res.json({ success: true, tier });
});

// Update Pricing Tier (e.g. changing VIP price from 22000 FC to 25000 FC or 25 USD)
app.put('/api/tickets/pricing/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedTier: TicketPricingTier | null = null;

  db.update(d => {
    const idx = d.pricingTiers.findIndex(t => t.id === id);
    if (idx >= 0) {
      d.pricingTiers[idx] = { ...d.pricingTiers[idx], ...updates };
      updatedTier = d.pricingTiers[idx];
    }
  });

  if (!updatedTier) {
    return res.status(404).json({ error: 'Tarif introuvable.' });
  }

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'MODIFICATION_TARIF',
    entity: 'PRICING',
    entityId: id,
    details: `Modification du tarif ${updatedTier.name} : Nouveau prix = ${updatedTier.price} ${updatedTier.currency}`,
  });

  res.json({ success: true, tier: updatedTier });
});

// Delete Pricing Tier
app.delete('/api/tickets/pricing/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  db.update(d => {
    d.pricingTiers = d.pricingTiers.filter(t => t.id !== id);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'SUPPRESSION_TARIF',
    entity: 'PRICING',
    entityId: id,
    details: `Suppression de la formule tarifaire ID ${id}`,
  });

  res.json({ success: true });
});

// ----------------------------------------------------
// 7. EVENTS MANAGEMENT
// ----------------------------------------------------

// Get Events (Public gets published; Auth can get all)
app.get('/api/events', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const user = authHeader ? verifyToken(authHeader.replace('Bearer ', '')) : null;

  if (user) {
    res.json({ events: db.get().events });
  } else {
    const published = db.get().events.filter(e => e.status === 'PUBLISHED');
    res.json({ events: published });
  }
});

// Create Event
app.post('/api/events', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const newEvent: FestivalEvent = {
    id: `EVT-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PUBLISHED',
    ...req.body,
  };

  db.update(d => {
    d.events.unshift(newEvent);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'CRÉATION_ÉVÉNEMENT',
    entity: 'EVENTS',
    entityId: newEvent.id,
    details: `Création de l'événement "${newEvent.name}" (${newEvent.date})`,
  });

  res.json({ success: true, event: newEvent });
});

// Update Event
app.put('/api/events/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedEvent: FestivalEvent | null = null;

  db.update(d => {
    const idx = d.events.findIndex(e => e.id === id);
    if (idx >= 0) {
      d.events[idx] = { ...d.events[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedEvent = d.events[idx];
    }
  });

  if (!updatedEvent) {
    return res.status(404).json({ error: 'Événement introuvable.' });
  }

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'MODIFICATION_ÉVÉNEMENT',
    entity: 'EVENTS',
    entityId: id,
    details: `Mise à jour de l'événement "${updatedEvent.name}" (Statut: ${updatedEvent.status})`,
  });

  res.json({ success: true, event: updatedEvent });
});

// Delete Event
app.delete('/api/events/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const event = db.get().events.find(e => e.id === id);

  db.update(d => {
    d.events = d.events.filter(e => e.id !== id);
  });

  if (event) {
    db.addAuditLog({
      userId: req.user!.id,
      userName: `${req.user!.firstName} ${req.user!.lastName}`,
      userRole: req.user!.role,
      action: 'SUPPRESSION_ÉVÉNEMENT',
      entity: 'EVENTS',
      entityId: id,
      details: `Suppression de l'événement "${event.name}"`,
    });
  }

  res.json({ success: true });
});

// ----------------------------------------------------
// 8. NEWS & ARTICLES
// ----------------------------------------------------

// Get News Articles (Public / Auth)
app.get('/api/news', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const user = authHeader ? verifyToken(authHeader.replace('Bearer ', '')) : null;

  if (user) {
    res.json({ news: db.get().news });
  } else {
    const published = db.get().news.filter(n => n.status === 'PUBLISHED');
    res.json({ news: published });
  }
});

// Create News Article
app.post('/api/news', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const newArticle: NewsArticle = {
    id: `NEWS-${Date.now()}`,
    slug: req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `article-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: req.body.publishedAt || new Date().toISOString(),
    status: req.body.status || 'PUBLISHED',
    author: req.body.author || `${req.user!.firstName} ${req.user!.lastName}`,
    ...req.body,
  };

  db.update(d => {
    d.news.unshift(newArticle);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'PUBLICATION_ACTUALITÉ',
    entity: 'NEWS',
    entityId: newArticle.id,
    details: `Création de l'article "${newArticle.title}"`,
  });

  res.json({ success: true, article: newArticle });
});

// Update News Article
app.put('/api/news/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedArticle: NewsArticle | null = null;

  db.update(d => {
    const idx = d.news.findIndex(n => n.id === id);
    if (idx >= 0) {
      d.news[idx] = { ...d.news[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedArticle = d.news[idx];
    }
  });

  if (!updatedArticle) {
    return res.status(404).json({ error: 'Article introuvable.' });
  }

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'MODIFICATION_ACTUALITÉ',
    entity: 'NEWS',
    entityId: id,
    details: `Mise à jour de l'article "${updatedArticle.title}" (Statut: ${updatedArticle.status})`,
  });

  res.json({ success: true, article: updatedArticle });
});

// Delete News Article
app.delete('/api/news/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const article = db.get().news.find(n => n.id === id);

  db.update(d => {
    d.news = d.news.filter(n => n.id !== id);
  });

  if (article) {
    db.addAuditLog({
      userId: req.user!.id,
      userName: `${req.user!.firstName} ${req.user!.lastName}`,
      userRole: req.user!.role,
      action: 'SUPPRESSION_ACTUALITÉ',
      entity: 'NEWS',
      entityId: id,
      details: `Suppression de l'article "${article.title}"`,
    });
  }

  res.json({ success: true });
});

// ----------------------------------------------------
// 9. GALLERY MANAGEMENT
// ----------------------------------------------------

// Get Gallery Albums
app.get('/api/gallery', (req: Request, res: Response) => {
  res.json({ albums: db.get().galleryAlbums });
});

// Create Album
app.post('/api/gallery', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const album: GalleryAlbum = {
    id: `ALB-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isPublished: true,
    images: [],
    ...req.body,
  };

  db.update(d => {
    d.galleryAlbums.unshift(album);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'CRÉATION_ALBUM',
    entity: 'GALLERY',
    entityId: album.id,
    details: `Création de l'album photo "${album.title}"`,
  });

  res.json({ success: true, album });
});

// Update Album
app.put('/api/gallery/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  let updatedAlbum: GalleryAlbum | null = null;

  db.update(d => {
    const idx = d.galleryAlbums.findIndex(a => a.id === id);
    if (idx >= 0) {
      d.galleryAlbums[idx] = { ...d.galleryAlbums[idx], ...updates };
      updatedAlbum = d.galleryAlbums[idx];
    }
  });

  if (!updatedAlbum) {
    return res.status(404).json({ error: 'Album introuvable.' });
  }

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'MODIFICATION_ALBUM',
    entity: 'GALLERY',
    entityId: id,
    details: `Mise à jour de l'album "${updatedAlbum.title}" (${updatedAlbum.images?.length || 0} photos)`,
  });

  res.json({ success: true, album: updatedAlbum });
});

// Delete Album
app.delete('/api/gallery/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const album = db.get().galleryAlbums.find(a => a.id === id);

  db.update(d => {
    d.galleryAlbums = d.galleryAlbums.filter(a => a.id !== id);
  });

  if (album) {
    db.addAuditLog({
      userId: req.user!.id,
      userName: `${req.user!.firstName} ${req.user!.lastName}`,
      userRole: req.user!.role,
      action: 'SUPPRESSION_ALBUM',
      entity: 'GALLERY',
      entityId: id,
      details: `Suppression de l'album "${album.title}"`,
    });
  }

  res.json({ success: true });
});

// ----------------------------------------------------
// 10. CONTACT MESSAGES
// ----------------------------------------------------

// Submit Contact Message (Public)
app.post('/api/messages', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nom, email et message obligatoires.' });
  }

  const newMessage: ContactMessage = {
    id: `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : undefined,
    subject: subject ? String(subject).trim() : 'Message depuis le site officiel',
    message: String(message).trim(),
    status: 'UNREAD',
    createdAt: new Date().toISOString(),
  };

  db.update(d => {
    d.messages = [newMessage, ...(d.messages || [])];
  });

  res.json({
    success: true,
    message: 'Votre message a été transmis avec succès à l\'équipe de JAMBO Festival.',
    messageId: newMessage.id,
  });
});

// Get Messages (Auth)
app.get('/api/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ messages: db.get().messages || [] });
});

// Update Message Status (Auth)
app.patch('/api/messages/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  db.update(d => {
    const msg = d.messages.find(m => m.id === id);
    if (msg && ['UNREAD', 'READ', 'PROCESSED'].includes(status)) {
      msg.status = status;
    }
  });

  res.json({ success: true });
});

// Delete Message (Auth)
app.delete('/api/messages/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  db.update(d => {
    d.messages = d.messages.filter(m => m.id !== id);
  });

  db.addAuditLog({
    userId: req.user!.id,
    userName: `${req.user!.firstName} ${req.user!.lastName}`,
    userRole: req.user!.role,
    action: 'SUPPRESSION_MESSAGE',
    entity: 'MESSAGES',
    entityId: id,
    details: `Suppression d'un message de contact`,
  });

  res.json({ success: true });
});

// ----------------------------------------------------
// 11. HIKES & TRAININGS REGISTRATIONS
// ----------------------------------------------------

app.get('/api/hikes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ hikes: db.get().hikes || [] });
});

app.post('/api/hikes', (req: Request, res: Response) => {
  const newHike = {
    id: `HIKE-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'CONFIRMED' as const,
    ...req.body,
  };

  db.update(d => {
    d.hikes = [newHike, ...(d.hikes || [])];
  });

  res.json({ success: true, hike: newHike });
});

app.get('/api/trainings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ trainings: db.get().trainings || [] });
});

app.post('/api/trainings', (req: Request, res: Response) => {
  const newTraining = {
    id: `TRN-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'CONFIRMÉ' as const,
    ...req.body,
  };

  db.update(d => {
    d.trainings = [newTraining, ...(d.trainings || [])];
  });

  res.json({ success: true, training: newTraining });
});

// ----------------------------------------------------
// 12. TICKETS & ACCESS CONTROL (SCANNER)
// ----------------------------------------------------

// Get Tickets
app.get('/api/tickets', (req: Request, res: Response) => {
  res.json({ tickets: db.get().tickets || [] });
});

// Sync / Create Tickets
app.post('/api/tickets', (req: Request, res: Response) => {
  const { tickets } = req.body;
  if (Array.isArray(tickets)) {
    db.update(d => {
      for (const ticket of tickets) {
        const idx = d.tickets.findIndex(t => t.ticketId === ticket.ticketId);
        if (idx >= 0) {
          d.tickets[idx] = ticket;
        } else {
          d.tickets.unshift(ticket);
        }
      }
    });
  }
  res.json({ success: true, count: db.get().tickets.length });
});

// Ticket Verification
app.post('/api/tickets/verify', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ valid: false, code: 'INVALID', message: 'Paramètre de recherche manquant.' });
  }

  const cleanQuery = String(query).trim().toUpperCase();
  const ticket = db.get().tickets.find(
    t => t.ticketId.toUpperCase() === cleanQuery || t.qrToken === query.trim()
  );

  if (!ticket) {
    return res.json({
      valid: false,
      code: 'INVALID',
      message: 'Billet introuvable ou code invalide. Aucun enregistrement officiel correspondant.',
    });
  }

  if (ticket.status === 'USED' || ticket.checkedIn) {
    return res.json({
      valid: false,
      code: 'ALREADY_USED',
      message: `Ce billet a déjà été validé à l'entrée le ${ticket.usedAt || ticket.checkedInAt ? new Date(ticket.usedAt || ticket.checkedInAt!).toLocaleString('fr-FR') : 'date enregistrée'}.`,
      ticket,
    });
  }

  if (ticket.status !== 'PAID') {
    return res.json({
      valid: false,
      code: 'UNPAID',
      message: `Statut du billet : ${ticket.status}. Le paiement n'a pas été confirmé.`,
      ticket,
    });
  }

  return res.json({
    valid: true,
    code: 'VALID',
    message: 'Billet officiel valide et confirmé pour la journée du 18 octobre 2026 !',
    ticket,
  });
});

// Ticket Check-in
app.post('/api/tickets/checkin', (req: Request, res: Response) => {
  const { ticketId, adminName } = req.body;
  if (!ticketId) {
    return res.status(400).json({ success: false, message: 'ticketId requis.' });
  }

  const cleanId = String(ticketId).trim().toUpperCase();
  let updatedTicket: Ticket | null = null;

  db.update(d => {
    const t = d.tickets.find(x => x.ticketId.toUpperCase() === cleanId);
    if (t) {
      t.status = 'USED';
      t.checkedIn = true;
      t.checkedInAt = new Date().toISOString();
      t.usedAt = t.checkedInAt;
      t.usedByAdmin = adminName || 'Staff Contrôle Entrée';
      updatedTicket = t;
    }
  });

  if (!updatedTicket) {
    return res.status(404).json({ success: false, message: 'Billet introuvable.' });
  }

  db.addAuditLog({
    userId: 'SCANNER',
    userName: adminName || 'Agent Scanner',
    userRole: 'ADMIN',
    action: 'CHECKIN_BILLET',
    entity: 'TICKETS',
    entityId: cleanId,
    details: `Entrée validée pour ${updatedTicket.participant?.firstName} ${updatedTicket.participant?.lastName} (${updatedTicket.type})`,
  });

  res.json({
    success: true,
    message: 'Billet marqué comme utilisé avec succès.',
    ticket: updatedTicket,
  });
});

// ----------------------------------------------------
// 13. AUDIT LOGS
// ----------------------------------------------------

app.get('/api/audit-logs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ logs: db.get().auditLogs || [] });
});

// ----------------------------------------------------
// 14. STATS SUMMARY
// ----------------------------------------------------

app.get('/api/stats', (req: Request, res: Response) => {
  const tickets = db.get().tickets || [];
  const totalSold = tickets.filter(t => t.status === 'PAID' || t.status === 'USED').length;
  const standardSold = tickets.filter(t => (t.status === 'PAID' || t.status === 'USED') && t.type === 'STANDARD').length;
  const vipSold = tickets.filter(t => (t.status === 'PAID' || t.status === 'USED') && t.type === 'VIP').length;
  const scannedCount = tickets.filter(t => t.status === 'USED' || t.checkedIn).length;
  const revenue = tickets
    .filter(t => t.status === 'PAID' || t.status === 'USED')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const hikeRegistrations = (db.get().hikes || []).length;
  const trainingRegistrations = (db.get().trainings || []).length;

  res.json({
    totalSold,
    standardSold,
    vipSold,
    scannedCount,
    revenue,
    hikeRegistrations,
    trainingRegistrations,
    totalTickets: tickets.length,
    unreadMessages: (db.get().messages || []).filter(m => m.status === 'UNREAD').length,
  });
});

// ----------------------------------------------------
// 15. AI ASSISTANT (JAMBO ASSISTANT)
// ----------------------------------------------------

const OFFICIAL_FESTIVAL_FACTS = `
OFFICIAL KNOWLEDGE BASE FOR JAMBO FESTIVAL 2026:
- Nom de l'événement: JAMBO FESTIVAL 2026 (3e édition)
- Slogan: « Pesa tourisme ya mboka chance ! »
- Message: « Faire du tourisme de notre pays une pépite. »
- Devise: « À la découverte des richesses naturelles, culturelles et touristiques de la République démocratique du Congo. »
- Dates principales:
  * 18 Octobre 2026 : Journée professionnelle, culturelle et touristique (Musée national de la RDC, Kinshasa).
  * 24 Octobre 2026 : Grande randonnée touristique à Amani Eco-Park, Mitendi (Kinshasa).
- RÈGLE IMPORTANTE SUR LES BILLETS :
  * Le billet du 18 octobre 2026 est valable UNIQUEMENT le 18 octobre 2026.
  * Il ne donne PAS automatiquement accès à la randonnée du 24 octobre 2026.
  * La réservation du 24 octobre est traitée comme une activité distincte.
- Tarifs Billetterie 18 Octobre 2026 :
  * Billet STANDARD : 15 USD (Accès complet à la journée du 18 octobre, exposition Musée national, ateliers, networking).
  * Billet VIP : 25 USD (Accès VIP, espace VIP Lounge & cocktail, places réservées, badge collector, rencontre privilégiée).
- Randonnée du 24 Octobre 2026 :
  * Lieu : Amani Eco-Park, Mitendi (Kinshasa).
  * Tarif de la randonnée : "Tarif et modalités de réservation à venir" (ne pas inventer de prix).
- Transport :
  * "Informations de transport à venir" (point de départ, horaires de navette à confirmer).
- Formations professionnelles :
  * Métiers : Hôtesse professionnelle et guide touristique (accueil, professionnalisation, insertion professionnelle).
- Exposition :
  * Lieu : Musée national de la RDC le 18 octobre 2026.
- Personnalités et invités de marque :
  * Madame Malicka Mukuba : Marraine de l'événement.
  * Godefroy Kizaba : Directeur Général de l'ANADEC (Agence Nationale de Développement de l'Entrepreneuriat Congolais).
  * Allan Lofoli : Chargé des agences – Province de Kinshasa, Office National du Tourisme (ONT).
  * Ir Claude Mbuyi : Président du Conseil National de la Jeunesse (CNJ).
- Histoire :
  * Année de création : 2024.
  * Édition précédente : 15 mars 2025 à Kinkole, Kinshasa.
- Mission & Vision :
  * Mission : Innover dans le secteur du tourisme grâce à des initiatives favorisant l'insertion professionnelle, la formation et la valorisation des métiers de l'accueil.
  * Vision : Créer des opportunités d'emploi, favoriser l'insertion professionnelle et contribuer à l'autonomisation des femmes à travers le tourisme.
- Valeurs : Professionnalisme, Inclusion, Respect de l'environnement, Promotion du patrimoine, Leadership féminin, Innovation.
- Horaires spécifiques des sessions : "Horaires à confirmer" (ne jamais inventer).
- Règle stricte : Ne JAMAIS inventer d'information manquante. Si une information n'est pas dans les données ci-dessus, réponds poliment : « Cette information n'est pas encore disponible dans les données officielles de JAMBO Festival. »
`;

app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message requis' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    const q = message.toLowerCase();
    let reply = "Bonjour ! Je suis l'assistant officiel de JAMBO Festival 2026. Comment puis-je vous renseigner ?";
    
    if (q.includes('quand') || q.includes('date') || q.includes('lieu')) {
      reply = "JAMBO Festival 2026 (3e édition) aura lieu le 18 octobre 2026 (Journée professionnelle au Musée national de la RDC) et le 24 octobre 2026 (Grande randonnée à Amani Eco-Park, Mitendi).";
    } else if (q.includes('combien') || q.includes('prix') || q.includes('tarif') || q.includes('billet')) {
      reply = "Les billets pour la journée du 18 octobre 2026 sont au tarif de 15 USD pour le Billet Standard et 25 USD pour le Billet VIP. Attention : le billet du 18 octobre est valable UNIQUEMENT le 18 octobre et ne donne pas accès à la randonnée du 24 octobre. Le tarif de la randonnée est à venir.";
    } else if (q.includes('marraine') || q.includes('invité') || q.includes('personnalité')) {
      reply = "La marraine de l'événement est Madame Malicka Mukuba. Les invités de marque sont M. Godefroy Kizaba (DG ANADEC), M. Allan Lofoli (ONT) et Ir Claude Mbuyi (Président du CNJ).";
    } else if (q.includes('randonnée') || q.includes('24')) {
      reply = "La Grande Randonnée touristique se tiendra le 24 octobre 2026 à Amani Eco-Park, Mitendi. C'est une activité distincte de la journée du 18 octobre. Tarif et modalités à venir.";
    } else if (q.includes('formation') || q.includes('hôtesse') || q.includes('guide')) {
      reply = "Les formations professionnelles portent sur les métiers d'hôtesse professionnelle et de guide touristique pour favoriser l'insertion des jeunes femmes et l'accueil en RDC. L'inscription se fait via le formulaire dédié.";
    } else {
      reply = "Cette information n'est pas encore disponible dans les données officielles de JAMBO Festival. N'hésitez pas à poser une autre question sur le programme, la billetterie ou les invités !";
    }

    return res.json({ reply });
  }

  try {
    const prompt = `Tu es l'assistant IA officiel et chaleureux de JAMBO FESTIVAL 2026 (3e édition) en RDC.
Slogan : « Pesa tourisme ya mboka chance ! ».
Voici les seules informations officielles autorisées :
${OFFICIAL_FESTIVAL_FACTS}

RÈGLES IMPORTANTES :
1. Réponds de façon élégante, claire, bienveillante, concise en français.
2. Basse-toi STRICTEMENT et UNIQUEMENT sur les faits officiels ci-dessus.
3. Si l'utilisateur demande une information qui n'est pas présente dans les données officielles, réponds exactement :
« Cette information n'est pas encore disponible dans les données officielles de JAMBO Festival. »
4. Rappelle systématiquement si la question porte sur les billets que le billet du 18 octobre est valable UNIQUEMENT le 18 octobre 2026 et est distinct de la randonnée du 24 octobre.

Question de l'utilisateur : "${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const replyText = response.text || "Bonjour ! Comment puis-je vous aider pour JAMBO Festival 2026 ?";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.json({
      reply: "Bonjour ! Je suis l'assistant officiel de JAMBO Festival 2026. Le 18 octobre aura lieu la journée professionnelle au Musée national de la RDC (Standard 15 USD, VIP 25 USD) et le 24 octobre la randonnée à Amani Eco-Park Mitendi.",
    });
  }
});

// ----------------------------------------------------
// 16. VITE MIDDLEWARE & SPA SERVING
// ----------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JAMBO FESTIVAL 2026 Full-Stack Platform running on port ${PORT}`);
  });
}

bootstrap();

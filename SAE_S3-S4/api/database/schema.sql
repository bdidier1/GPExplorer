-- =============================================
-- Script SQL - Modélisation de la base de données
-- Projet SAE S3-S4 - Application événementielle
-- =============================================

-- Suppression des tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS provider_messages;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS visitor_counts;
DROP TABLE IF EXISTS guestbook_entries;
DROP TABLE IF EXISTS map_requests;
DROP TABLE IF EXISTS map_locations;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS ticket_holds;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS provider_products;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS home_contents;
DROP TABLE IF EXISTS users;

-- =============================================
-- TABLE: users
-- Description: Utilisateurs de l'application
-- Rôles: user, provider, organizer
-- =============================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'provider', 'organizer') NOT NULL DEFAULT 'user',
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    -- Champs spécifiques aux prestataires
    company_name VARCHAR(100),
    category VARCHAR(50),
    contact_person VARCHAR(100),
    -- Champs spécifiques aux organisateurs
    organization VARCHAR(100),
    position VARCHAR(100),
    -- QR Code unique pour l'utilisateur
    qr_code_id VARCHAR(100) UNIQUE,
    -- Champs OAuth
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',
    google_id VARCHAR(100) UNIQUE,
    discord_id VARCHAR(100) UNIQUE,
    picture VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: sessions
-- Description: Gestion des sessions utilisateurs
-- Relation: User (1) -> Session (N)
-- =============================================
CREATE TABLE sessions (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    user_id CHAR(36) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_sessions_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLE: ticket_holds
-- Description: Réservations temporaires du panier
-- Relation: User (1) -> TicketHold (N)
-- =============================================
CREATE TABLE ticket_holds (
    hold_id VARCHAR(64) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    items JSON NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_holds_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLE: tickets
-- Description: Billets de l'événement
-- =============================================
CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    segment VARCHAR(50) NOT NULL DEFAULT 'grand_prix',
    category VARCHAR(50) NOT NULL,
    variant VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    date DATE,
    description TEXT,
    total_stock INT NOT NULL DEFAULT 0,
    sold INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: orders
-- Description: Commandes de billets
-- Relation: User (1) -> Order (N)
-- =============================================
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    user_id CHAR(36),
    email VARCHAR(100) NOT NULL,
    hold_id VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_orders_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================
-- TABLE: order_items
-- Description: Détails des articles dans une commande
--             Supporte billets, produits prestataires et merch
-- Relations: Order (1) -> OrderItem (N)
--            Ticket (1) -> OrderItem (N)  [si item_type = 'ticket']
--            ProviderProduct (1) -> OrderItem (N)  [si item_type = 'shop']
-- =============================================
CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    order_id CHAR(36) NOT NULL,
    ticket_id VARCHAR(50),                            -- NULL si produit boutique/merch
    product_id CHAR(36),                              -- NULL si billet/merch
    item_type VARCHAR(20) NOT NULL DEFAULT 'ticket',  -- 'ticket', 'shop' ou 'merch'
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    code VARCHAR(50) UNIQUE,                          -- Code unique (TKT-*, SHOP-*, MERCH-*)
    verified BOOLEAN DEFAULT FALSE,
    verified_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_order_items_order 
        FOREIGN KEY (order_id) REFERENCES orders(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_ticket 
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product 
        FOREIGN KEY (product_id) REFERENCES provider_products(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================
-- TABLE: providers
-- Description: Prestataires de l'événement
-- Relation: User (1) -> Provider (1)
-- =============================================
CREATE TABLE providers (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    user_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    logo VARCHAR(255),
    html_content TEXT,                                -- Contenu HTML (éditeur WYSIWYG)
    content_data LONGTEXT,                            -- JSON du contenu structuré (services, à propos...)
    has_stats_access BOOLEAN NOT NULL DEFAULT FALSE, -- Accès aux statistiques prestataire
    has_guestbook_access BOOLEAN NOT NULL DEFAULT TRUE, -- Accès au livre d'or
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_providers_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLE: provider_products
-- Description: Produits vendus par les prestataires (boutique)
-- Relation: Provider (1) -> ProviderProduct (N)
-- =============================================
CREATE TABLE provider_products (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    provider_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_i18n JSON,                                  -- Titre multilingue { fr, en, es }
    description TEXT,
    description_i18n JSON,                            -- Description multilingue { fr, en, es }
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,                     -- Stock total
    sold INT NOT NULL DEFAULT 0,                      -- Quantité vendue
    category VARCHAR(50),
    image VARCHAR(255),
    tags JSON,                                        -- Tags sous forme de tableau JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_provider_products_provider 
        FOREIGN KEY (provider_id) REFERENCES providers(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLE: map_locations
-- Description: Emplacements sur la carte interactive
-- Relation: Provider (1) -> MapLocation (1)
-- =============================================
CREATE TABLE map_locations (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    name VARCHAR(100) NOT NULL,
    x FLOAT NOT NULL,                                 -- Coordonnée X sur la carte SVG
    y FLOAT NOT NULL,                                 -- Coordonnée Y sur la carte SVG
    coords JSON,                                      -- Coordonnées/forme détaillées (optionnel)
    provider_id CHAR(36),                             -- Peut être NULL si emplacement libre
    description TEXT,
    zone VARCHAR(50),                                 -- Zone de la carte
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_map_locations_provider 
        FOREIGN KEY (provider_id) REFERENCES providers(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================
-- TABLE: map_requests
-- Description: Demandes d'emplacement sur la carte
-- Relation: Provider (1) -> MapRequest (N)
-- =============================================
CREATE TABLE map_requests (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    provider_id CHAR(36) NOT NULL,
    provider_username VARCHAR(100),
    provider_display_name VARCHAR(200),
    provider_contact VARCHAR(200),
    spot_id VARCHAR(100) NOT NULL,
    spot_label VARCHAR(200),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reviewed_at DATETIME,
    reviewed_by JSON,
    decision_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_map_requests_provider
        FOREIGN KEY (provider_id) REFERENCES providers(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLE: home_contents
-- Description: Contenu de la page d'accueil (multilingue)
-- =============================================
CREATE TABLE home_contents (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    language VARCHAR(5) NOT NULL DEFAULT 'fr',
    title VARCHAR(255) NOT NULL,
    html_content TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_language (language)
);

-- =============================================
-- TABLE: guestbook_entries
-- Description: Livre d'or des prestataires
-- Relation: Provider (1) -> GuestbookEntry (N)
-- =============================================
CREATE TABLE guestbook_entries (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    provider_id CHAR(36) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(100),
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_guestbook_provider 
        FOREIGN KEY (provider_id) REFERENCES providers(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLE: visitor_counts
-- Description: Comptage des visiteurs (statistiques)
-- Relation: Provider (1) -> VisitorCount (N)
-- =============================================
CREATE TABLE visitor_counts (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    provider_id CHAR(36) NOT NULL,
    count INT NOT NULL DEFAULT 1,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    hour INT,                                         -- Heure (0-23)
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_visitor_counts_provider 
        FOREIGN KEY (provider_id) REFERENCES providers(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLE: contact_messages
-- Description: Messages de contact envoyés à l'admin
-- =============================================
CREATE TABLE contact_messages (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: provider_messages
-- Description: Messages privés envoyés aux prestataires
-- Relation: Provider (1) -> ProviderMessage (N)
-- =============================================
CREATE TABLE provider_messages (
    id CHAR(36) PRIMARY KEY,                          -- UUID
    provider_id CHAR(36) NOT NULL,
    author VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_provider_messages_provider 
        FOREIGN KEY (provider_id) REFERENCES providers(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- INDEX POUR OPTIMISATION DES REQUÊTES
-- =============================================

-- Index sur les clés étrangères
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_ticket_holds_user_id ON ticket_holds(user_id);
CREATE INDEX idx_ticket_holds_expires_at ON ticket_holds(expires_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_ticket_id ON order_items(ticket_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_item_type ON order_items(item_type);
CREATE INDEX idx_provider_products_provider_id ON provider_products(provider_id);
CREATE INDEX idx_provider_products_category ON provider_products(category);
CREATE INDEX idx_provider_products_is_active ON provider_products(is_active);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_map_locations_provider_id ON map_locations(provider_id);
CREATE INDEX idx_map_requests_provider_id ON map_requests(provider_id);
CREATE INDEX idx_map_requests_status ON map_requests(status);
CREATE INDEX idx_guestbook_provider_id ON guestbook_entries(provider_id);
CREATE INDEX idx_visitor_counts_provider_id ON visitor_counts(provider_id);
CREATE INDEX idx_provider_messages_provider_id ON provider_messages(provider_id);

-- Index sur les champs fréquemment recherchés
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tickets_segment ON tickets(segment);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_visitor_counts_date ON visitor_counts(date);

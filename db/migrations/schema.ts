import { pgTable, foreignKey, unique, uuid, text, timestamp, integer, date, time, numeric, boolean, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const invitations = pgTable("invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	code: text().notNull(),
	email: text().notNull(),
	status: text().default('pending'),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	invitedName: text("invited_name"),
	role: text().default('Resident'),
	hoaPosition: text("hoa_position"),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "invitations_community_id_communities_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [neighbors.id],
			name: "invitations_created_by_neighbors_id_fk"
		}),
	unique("invitations_code_unique").on(table.code),
]);

export const eventRsvps = pgTable("event_rsvps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventId: uuid("event_id").notNull(),
	neighborId: uuid("neighbor_id").notNull(),
	guestCount: integer("guest_count").default(1),
	status: text().default('Going'),
	rsvpDate: timestamp("rsvp_date", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_rsvps_event_id_events_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.neighborId],
			foreignColumns: [neighbors.id],
			name: "event_rsvps_neighbor_id_neighbors_id_fk"
		}),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	category: text(),
	uploadDate: timestamp("upload_date", { withTimezone: true, mode: 'string' }).defaultNow(),
	size: text(),
	url: text(),
	uploaderId: uuid("uploader_id"),
	communityId: uuid("community_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.uploaderId],
			foreignColumns: [neighbors.id],
			name: "documents_uploader_id_neighbors_id_fk"
		}),
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "documents_community_id_communities_id_fk"
		}),
]);

export const events = pgTable("events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	date: date().notNull(),
	time: time().notNull(),
	location: text(),
	category: text(),
	organizerId: uuid("organizer_id"),
	attendeesCount: integer("attendees_count").default(0),
	communityId: uuid("community_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizerId],
			foreignColumns: [neighbors.id],
			name: "events_organizer_id_neighbors_id_fk"
		}),
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "events_community_id_communities_id_fk"
		}),
]);

export const marketplaceItems = pgTable("marketplace_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).default('0'),
	isFree: boolean("is_free").default(false),
	isNegotiable: boolean("is_negotiable").default(false),
	images: text().array(),
	status: text().default('Active'),
	postedDate: timestamp("posted_date", { withTimezone: true, mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	sellerId: uuid("seller_id"),
	communityId: uuid("community_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sellerId],
			foreignColumns: [neighbors.id],
			name: "marketplace_items_seller_id_neighbors_id_fk"
		}),
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "marketplace_items_community_id_communities_id_fk"
		}),
]);

export const resources = pgTable("resources", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: text(),
	capacity: integer(),
	description: text(),
	isReservable: boolean("is_reservable").default(true),
	imageUrl: text("image_url"),
	communityId: uuid("community_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "resources_community_id_communities_id_fk"
		}),
]);

export const neighbors = pgTable("neighbors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	role: text().default('Resident'),
	address: text(),
	skills: text().array(),
	joinedDate: timestamp("joined_date", { withTimezone: true, mode: 'string' }).defaultNow(),
	isOnline: boolean("is_online").default(false),
	personalEmergencyCode: text("personal_emergency_code"),
	personalEmergencyInstructions: text("personal_emergency_instructions"),
	hoaPosition: text("hoa_position"),
	userId: uuid("user_id"),
	equipment: json().default([]),
	roles: text().array().default(["RAY['Resident'::tex"]),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "neighbors_community_id_communities_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "neighbors_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	password: text(),
	name: text().notNull(),
	avatar: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const communities = pgTable("communities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text(),
	planTuple: text("plan_tuple").default('starter_100'),
	maxHomes: integer("max_homes").default(100),
	isActive: boolean("is_active").default(true),
	logoUrl: text("logo_url"),
	primaryColor: text("primary_color").default('#4f46e5'),
	secondaryColor: text("secondary_color").default('#1e1b4b'),
	accentColor: text("accent_color").default('#f59e0b'),
	hasMarketplace: boolean("has_marketplace").default(true),
	hasResources: boolean("has_resources").default(true),
	hasEvents: boolean("has_events").default(true),
	hasDocuments: boolean("has_documents").default(true),
	hasForum: boolean("has_forum").default(true),
	hasMessages: boolean("has_messages").default(true),
	hasServicePros: boolean("has_service_pros").default(true),
	hasLocalGuide: boolean("has_local_guide").default(true),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	emergencyAccessCode: text("emergency_access_code"),
	emergencyInstructions: text("emergency_instructions"),
	hasEmergency: boolean("has_emergency").default(true),
	hoaDuesAmount: numeric("hoa_dues_amount", { precision: 10, scale:  2 }),
	hoaDuesFrequency: text("hoa_dues_frequency").default('Monthly'),
	hoaDuesDate: text("hoa_dues_date").default('1st'),
	hoaContactEmail: text("hoa_contact_email"),
}, (table) => [
	unique("communities_slug_unique").on(table.slug),
]);

export const localPlaces = pgTable("local_places", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	name: text().notNull(),
	category: text().notNull(),
	address: text(),
	description: text(),
	rating: numeric({ precision: 2, scale:  1 }),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "local_places_community_id_communities_id_fk"
		}),
]);

export const directMessages = pgTable("direct_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	senderId: uuid("sender_id").notNull(),
	recipientId: uuid("recipient_id").notNull(),
	content: text().notNull(),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [neighbors.id],
			name: "direct_messages_sender_id_neighbors_id_fk"
		}),
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [neighbors.id],
			name: "direct_messages_recipient_id_neighbors_id_fk"
		}),
]);

export const forumPosts = pgTable("forum_posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	authorId: uuid("author_id").notNull(),
	content: text().notNull(),
	category: text().notNull(),
	likes: integer().default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "forum_posts_community_id_communities_id_fk"
		}),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [neighbors.id],
			name: "forum_posts_author_id_neighbors_id_fk"
		}),
]);

export const forumComments = pgTable("forum_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	authorId: uuid("author_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [forumPosts.id],
			name: "forum_comments_post_id_forum_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [neighbors.id],
			name: "forum_comments_author_id_neighbors_id_fk"
		}),
]);

export const serviceProviders = pgTable("service_providers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	name: text().notNull(),
	category: text().notNull(),
	phone: text(),
	rating: numeric({ precision: 2, scale:  1 }).default('5.0'),
	description: text(),
	recommendedBy: text("recommended_by"),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "service_providers_community_id_communities_id_fk"
		}),
]);

export const forumLikes = pgTable("forum_likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	memberId: uuid("member_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [forumPosts.id],
			name: "forum_likes_post_id_forum_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.memberId],
			foreignColumns: [neighbors.id],
			name: "forum_likes_member_id_neighbors_id_fk"
		}),
]);

export const announcements = pgTable("announcements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	communityId: uuid("community_id").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	authorId: uuid("author_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	activateAt: timestamp("activate_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.communityId],
			foreignColumns: [communities.id],
			name: "announcements_community_id_communities_id_fk"
		}),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [neighbors.id],
			name: "announcements_author_id_neighbors_id_fk"
		}),
]);

import { relations } from "drizzle-orm/relations";
import { communities, invitations, neighbors, events, eventRsvps, documents, marketplaceItems, resources, users, localPlaces, directMessages, forumPosts, forumComments, serviceProviders, forumLikes, announcements } from "./schema";

export const invitationsRelations = relations(invitations, ({one}) => ({
	community: one(communities, {
		fields: [invitations.communityId],
		references: [communities.id]
	}),
	neighbor: one(neighbors, {
		fields: [invitations.createdBy],
		references: [neighbors.id]
	}),
}));

export const communitiesRelations = relations(communities, ({many}) => ({
	invitations: many(invitations),
	documents: many(documents),
	events: many(events),
	marketplaceItems: many(marketplaceItems),
	resources: many(resources),
	neighbors: many(neighbors),
	localPlaces: many(localPlaces),
	forumPosts: many(forumPosts),
	serviceProviders: many(serviceProviders),
	announcements: many(announcements),
}));

export const neighborsRelations = relations(neighbors, ({one, many}) => ({
	invitations: many(invitations),
	eventRsvps: many(eventRsvps),
	documents: many(documents),
	events: many(events),
	marketplaceItems: many(marketplaceItems),
	community: one(communities, {
		fields: [neighbors.communityId],
		references: [communities.id]
	}),
	user: one(users, {
		fields: [neighbors.userId],
		references: [users.id]
	}),
	directMessages_senderId: many(directMessages, {
		relationName: "directMessages_senderId_neighbors_id"
	}),
	directMessages_recipientId: many(directMessages, {
		relationName: "directMessages_recipientId_neighbors_id"
	}),
	forumPosts: many(forumPosts),
	forumComments: many(forumComments),
	forumLikes: many(forumLikes),
	announcements: many(announcements),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({one}) => ({
	event: one(events, {
		fields: [eventRsvps.eventId],
		references: [events.id]
	}),
	neighbor: one(neighbors, {
		fields: [eventRsvps.neighborId],
		references: [neighbors.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	eventRsvps: many(eventRsvps),
	neighbor: one(neighbors, {
		fields: [events.organizerId],
		references: [neighbors.id]
	}),
	community: one(communities, {
		fields: [events.communityId],
		references: [communities.id]
	}),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	neighbor: one(neighbors, {
		fields: [documents.uploaderId],
		references: [neighbors.id]
	}),
	community: one(communities, {
		fields: [documents.communityId],
		references: [communities.id]
	}),
}));

export const marketplaceItemsRelations = relations(marketplaceItems, ({one}) => ({
	neighbor: one(neighbors, {
		fields: [marketplaceItems.sellerId],
		references: [neighbors.id]
	}),
	community: one(communities, {
		fields: [marketplaceItems.communityId],
		references: [communities.id]
	}),
}));

export const resourcesRelations = relations(resources, ({one}) => ({
	community: one(communities, {
		fields: [resources.communityId],
		references: [communities.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	neighbors: many(neighbors),
}));

export const localPlacesRelations = relations(localPlaces, ({one}) => ({
	community: one(communities, {
		fields: [localPlaces.communityId],
		references: [communities.id]
	}),
}));

export const directMessagesRelations = relations(directMessages, ({one}) => ({
	neighbor_senderId: one(neighbors, {
		fields: [directMessages.senderId],
		references: [neighbors.id],
		relationName: "directMessages_senderId_neighbors_id"
	}),
	neighbor_recipientId: one(neighbors, {
		fields: [directMessages.recipientId],
		references: [neighbors.id],
		relationName: "directMessages_recipientId_neighbors_id"
	}),
}));

export const forumPostsRelations = relations(forumPosts, ({one, many}) => ({
	community: one(communities, {
		fields: [forumPosts.communityId],
		references: [communities.id]
	}),
	neighbor: one(neighbors, {
		fields: [forumPosts.authorId],
		references: [neighbors.id]
	}),
	forumComments: many(forumComments),
	forumLikes: many(forumLikes),
}));

export const forumCommentsRelations = relations(forumComments, ({one}) => ({
	forumPost: one(forumPosts, {
		fields: [forumComments.postId],
		references: [forumPosts.id]
	}),
	neighbor: one(neighbors, {
		fields: [forumComments.authorId],
		references: [neighbors.id]
	}),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({one}) => ({
	community: one(communities, {
		fields: [serviceProviders.communityId],
		references: [communities.id]
	}),
}));

export const forumLikesRelations = relations(forumLikes, ({one}) => ({
	forumPost: one(forumPosts, {
		fields: [forumLikes.postId],
		references: [forumPosts.id]
	}),
	neighbor: one(neighbors, {
		fields: [forumLikes.memberId],
		references: [neighbors.id]
	}),
}));

export const announcementsRelations = relations(announcements, ({one}) => ({
	community: one(communities, {
		fields: [announcements.communityId],
		references: [communities.id]
	}),
	neighbor: one(neighbors, {
		fields: [announcements.authorId],
		references: [neighbors.id]
	}),
}));
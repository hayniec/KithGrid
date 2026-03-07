import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableRow, TableCell, Table, WidthType, BorderStyle, TabStopPosition, TabStopType } from "docx";
import * as fs from "fs";

const PRIMARY = "4f46e5";

function title(text) {
  return new Paragraph({
    heading: HeadingLevel.TITLE,
    spacing: { after: 100 },
    children: [new TextRun({ text, bold: true, size: 48, color: PRIMARY })],
  });
}

function subtitle(text) {
  return new Paragraph({
    spacing: { after: 300 },
    children: [new TextRun({ text, size: 24, color: "6b7280", italics: true })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 150 },
    children: [new TextRun({ text, bold: true, size: 32, color: PRIMARY })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" } },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 250, after: 100 },
    children: [new TextRun({ text, bold: true, size: 26 })],
  });
}

function para(...runs) {
  return new Paragraph({
    spacing: { after: 150 },
    children: runs,
  });
}

function bold(text) { return new TextRun({ text, bold: true }); }
function normal(text) { return new TextRun({ text }); }
function code(text) { return new TextRun({ text, font: "Courier New", size: 20, shading: { fill: "f3f4f6" } }); }

function bullet(runs, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: Array.isArray(runs) ? runs : [normal(runs)],
  });
}

function numbered(runs, level = 0) {
  return new Paragraph({
    numbering: { reference: "default-numbering", level },
    spacing: { after: 60 },
    children: Array.isArray(runs) ? runs : [normal(runs)],
  });
}

function separator() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" } },
    children: [],
  });
}

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
      shading: { fill: "f9fafb" },
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    })),
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── USER GUIDE ──

function buildUserGuide() {
  return new Document({
    numbering: { config: [{ reference: "default-numbering", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 360, hanging: 360 }}}}]}]},
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        title("KithGrid User Guide"),
        subtitle("Your community's digital hub for connecting with neighbors, sharing resources, and staying informed."),

        h2("Getting Started"),
        h3("Joining Your Community"),
        numbered([bold("Invitation code"), normal(" — you'll receive one from your community administrator (via email or directly).")]),
        numbered([normal("Go to the "), bold("Join"), normal(" page ("), code("/join"), normal(") and enter your code.")]),
        numbered([normal("Fill out your profile: first/last name, email, password, home address (optional).")]),
        numbered([normal("Check your email for a "), bold("verification link"), normal(" and confirm your account.")]),
        numbered([normal("You're in! You'll land on the community dashboard.")]),

        h3("Switching Communities"),
        para(normal("If you belong to multiple communities, use the "), bold("community switcher"), normal(" in the sidebar to change which one you're viewing.")),

        separator(),
        h2("Dashboard"),
        para(code("/dashboard")),
        bullet([bold("Announcements"), normal(" from your community admins and board")]),
        bullet([bold("Upcoming events"), normal(" at a glance")]),
        bullet([bold("HOA officer directory"), normal(" with contact info")]),
        bullet([bold("Onboarding checklist"), normal(" (for new members)")]),

        separator(),
        h2("Forum"),
        para(code("/dashboard/forum")),
        para(normal("The forum is where your community discusses everything from safety tips to lost pets.")),
        bullet([bold("Browse posts"), normal(" by category: General, Safety, Events, Lost & Found, Recommendations")]),
        bullet([bold("Create a post"), normal(" — pick a category and write your message")]),
        bullet([bold("Like and comment"), normal(" on posts from neighbors")]),
        bullet([bold("Filter"), normal(" by category to find relevant discussions")]),
        bullet([bold("Message someone"), normal(" directly from their forum profile")]),

        separator(),
        h2("Messages"),
        para(code("/dashboard/messages")),
        para(normal("Private one-to-one messaging with your neighbors.")),
        bullet([normal("View your "), bold("conversation list"), normal(" with unread indicators")]),
        bullet([bold("Start a new conversation"), normal(" with any community member")]),
        bullet([normal("Full "), bold("message history"), normal(" is preserved per conversation")]),

        separator(),
        h2("Neighbors Directory"),
        para(code("/dashboard/neighbors")),
        bullet([bold("Search"), normal(" by name, skills, or equipment")]),
        bullet([normal("View neighbor profiles — skills, shared equipment")]),
        bullet([bold("Contact neighbors"), normal(" directly from their profile card")]),

        separator(),
        h2("Events"),
        para(code("/dashboard/events")),
        bullet([normal("Browse "), bold("upcoming events"), normal(" with date, time, and location")]),
        bullet([bold("RSVP"), normal(" to events and set your guest count")]),
        bullet([normal("See how many people are going")]),
        bullet([normal("Filter and sort events by date")]),

        separator(),
        h2("Marketplace"),
        para(code("/dashboard/marketplace")),
        bullet([bold("Browse listings"), normal(" — search by keyword, filter by price")]),
        bullet([bold("Post an item"), normal(" for sale, trade, or free")]),
        bullet([normal("Add up to 5 photos, set price, set expiration date")], 1),
        bullet([bold("Contact sellers"), normal(" directly via email")]),

        separator(),
        h2("Service Professionals"),
        para(code("/dashboard/services")),
        bullet([normal("Browse by category: Handyman, Roofer, Landscaping, Tree Service, etc.")]),
        bullet([normal("See "), bold("ratings"), normal(" and which neighbor recommended them")]),
        bullet([bold("Call providers"), normal(" directly from the listing")]),
        bullet([bold("Recommend"), normal(" a service provider you trust")]),

        separator(),
        h2("Local Guide"),
        para(code("/dashboard/local")),
        bullet([normal("Browse local spots by category")]),
        bullet([normal("See ratings, addresses, and descriptions")]),
        bullet([bold("Add a new spot"), normal(" that you recommend")]),

        separator(),
        h2("Community Resources"),
        para(code("/dashboard/resources")),
        bullet([normal("Browse available resources (clubhouse, pool, shared tools, etc.)")]),
        bullet([bold("Reserve"), normal(" a resource by selecting a date and time slot")]),
        bullet([normal("View your confirmed reservations")]),

        separator(),
        h2("Settings"),
        para(code("/dashboard/settings")),
        h3("Profile"),
        bullet([normal("Edit your "), bold("name, address, and bio")]),
        bullet([normal("Add "), bold("skills"), normal(" you're willing to share")]),
        bullet([normal("List "), bold("equipment"), normal(" you're willing to lend")]),
        bullet([normal("Upload your "), bold("avatar")]),
        h3("Appearance"),
        bullet([normal("Switch between "), bold("Light, Dark, or System"), normal(" theme")]),
        bullet([normal("Show or hide the emergency tab")]),
        h3("Emergency Button"),
        bullet([normal("Enable a "), bold("floating emergency button"), normal(" on every page")]),
        bullet([normal("Choose which corner of the screen it appears in")]),
        h3("Notifications"),
        bullet([normal("Toggle "), bold("email alerts"), normal(" on/off")]),
        bullet([normal("Toggle "), bold("SMS emergency alerts")]),
        bullet([normal("Set preferred alert method (text, call, or both)")]),
        h3("Emergency Safety Network"),
        bullet([normal("Add a "), bold("personal emergency access code")]),
        bullet([normal("Add "), bold("external emergency contacts"), normal(" (family, doctors)")]),
        bullet([normal("Set a "), bold("primary emergency contact")]),
        bullet([normal("Select "), bold("medically-trained neighbors"), normal(" to notify in emergencies")]),

        separator(),
        h2("Emergency"),
        para(code("/dashboard/emergency")),
        bullet([bold("One-tap SOS"), normal(" button alerts all your configured emergency contacts")]),
        bullet([normal("A "), bold("3-second countdown"), normal(" gives you time to cancel if pressed accidentally")]),
        bullet([normal("Quick shortcuts to "), bold("call 911"), normal(" and "), bold("Poison Control")]),
        bullet([normal("View which contacts will be notified before sending")]),

        separator(),
        h2("Tips"),
        bullet([normal("Keep your "), bold("address"), normal(" up to date — it's used in emergency alerts.")]),
        bullet([normal("Add your "), bold("skills and equipment"), normal(" so neighbors know what help you can offer.")]),
        bullet([bold("RSVP to events"), normal(" so organizers can plan properly.")]),
        bullet([normal("Check the "), bold("forum"), normal(" regularly for community updates and safety alerts.")]),
      ],
    }],
  });
}

// ── ADMIN GUIDE ──

function buildAdminGuide() {
  return new Document({
    numbering: { config: [{ reference: "default-numbering", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 360, hanging: 360 }}}}]}]},
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        title("KithGrid Administrator Guide"),
        subtitle("For community administrators who manage a single neighborhood or HOA within KithGrid."),

        h2("Accessing the Admin Console"),
        para(code("/dashboard/admin")),
        para(normal("Available to users with the "), bold("Admin"), normal(" or "), bold("Board Member"), normal(" role. Five tabs:")),
        bullet("Configuration"), bullet("User Management"), bullet("Invitations"), bullet("Resources"), bullet("Plan & Billing"),

        separator(),
        h2("Configuration Tab"),
        h3("Branding & Appearance"),
        bullet([bold("Community Logo"), normal(" — upload or set a logo URL")]),
        bullet([bold("Primary Color"), normal(" — main accent for buttons, links, highlights")]),
        bullet([bold("Secondary Color"), normal(" — sidebar and secondary UI elements")]),
        bullet([bold("Accent Color"), normal(" — progress bars, badges, emphasis")]),
        para(normal("Click "), bold("Save Branding"), normal(" to persist to the database.")),
        h3("HOA Settings"),
        makeTable(["Field", "Description"], [
          ["Dues Amount", "Monthly/quarterly/annual HOA fee"],
          ["Frequency", "Monthly, Quarterly, or Annual"],
          ["Due Date", "Day of the month dues are due"],
          ["Contact Email", "HOA's official contact email"],
        ]),
        h3("Extended Settings"),
        bullet([bold("Amenities"), normal(" — pool, gym, clubhouse with icons, hours, notes")]),
        bullet([bold("Community Rules"), normal(" — define and publish rules")]),
        bullet([bold("Approved Vendors"), normal(" — HOA-approved vendor list")]),

        separator(),
        h2("User Management Tab"),
        h3("Member List"),
        bullet([normal("See every member's "), bold("name, role, address, email, and join date")]),
        bullet([bold("Search"), normal(" members by name")]),
        h3("Editing Members"),
        para(normal("Click "), bold("Edit"), normal(" on any member to:")),
        bullet([normal("Change their "), bold("role"), normal(" (Resident, Admin, Board Member, Event Manager)")]),
        bullet([normal("Update their "), bold("address")]),
        bullet([normal("Mark as "), bold("HOA Officer"), normal(" and assign a position")]),
        h3("Removing Members"),
        bullet([normal("Click "), bold("Delete"), normal(" to permanently remove a member")]),

        separator(),
        h2("Invitations Tab"),
        h3("Creating Invitations"),
        numbered([normal("Enter the "), bold("email address"), normal(" of the person you want to invite")]),
        numbered([normal("Select their "), bold("role"), normal(" (defaults to Resident)")]),
        numbered([normal("Click "), bold("Generate Invitation")]),
        numbered([normal("A unique "), bold("6-character code"), normal(" is generated and emailed")]),
        numbered([normal("They use it at "), code("/join"), normal(" to sign up")]),
        h3("Bulk Import"),
        numbered([normal("Click "), bold("Import CSV")]),
        numbered([normal("Upload CSV with "), code("email"), normal(" and optionally "), code("name"), normal(" columns")]),
        numbered("Invitations generated for all rows"),
        h3("Managing Invitations"),
        bullet([normal("View status: "), bold("Pending"), normal(", "), bold("Used"), normal(", or "), bold("Expired")]),
        bullet([bold("Delete"), normal(" or "), bold("Copy"), normal(" invitation codes")]),
        para(bold("Note: "), normal("Invitations are blocked when at the plan's member limit. Upgrade in the Billing tab.")),

        separator(),
        h2("Resources Tab"),
        h3("Adding Resources"),
        numbered([normal("Click "), bold("Add New Resource")]),
        numbered([normal("Fill in Name, Type (Facility/Tool/Vehicle), Capacity, Description")]),
        numbered("Resource becomes available for reservations"),
        h3("Deleting Resources"),
        bullet([normal("Click "), bold("Delete"), normal(" — existing reservations are also removed")]),

        separator(),
        h2("Plan & Billing Tab"),
        h3("Current Usage"),
        bullet([bold("Member count"), normal(" vs. plan limit (progress bar)")]),
        bullet([normal("Color-coded: Green (OK), Yellow (80%+), Red (at capacity)")]),
        h3("Trial Period"),
        para(normal("New communities start with a "), bold("14-day free trial"), normal(". Yellow banner shows days remaining. Red banner when expired.")),
        h3("Choosing a Plan"),
        makeTable(["Plan", "Max Homes", "Best For"], [
          ["Starter", "100", "Small neighborhoods"],
          ["Growth", "250", "Mid-size communities"],
          ["Pro", "500", "Large HOAs and condo associations"],
        ]),
        bullet([normal("Cannot "), bold("downgrade"), normal(" below current member count")]),
        bullet([normal("Selecting a plan sets status to "), bold("Active")]),

        separator(),
        h2("Role Reference"),
        makeTable(["Role", "Admin Console", "Create Events", "Manage Members", "Send Invites"], [
          ["Resident", "No", "No", "No", "No"],
          ["Event Manager", "No", "Yes", "No", "No"],
          ["Board Member", "Partial", "Yes", "Yes", "No"],
          ["Admin", "Yes", "Yes", "Yes", "Yes"],
        ]),

        separator(),
        h2("Common Tasks"),
        h3('"A resident needs to be removed"'),
        numbered([normal("Go to "), bold("User Management"), normal(" tab")]),
        numbered("Find the member"),
        numbered([normal("Click "), bold("Delete"), normal(" and confirm")]),
        h3('"We need to change our HOA dues"'),
        numbered([normal("Go to "), bold("Configuration"), normal(" tab")]),
        numbered("Update the dues amount, frequency, or due date"),
        numbered([normal("Click "), bold("Save HOA Settings")]),
        h3('"We\'re running out of member slots"'),
        numbered([normal("Go to "), bold("Plan & Billing"), normal(" tab")]),
        numbered("Review current usage"),
        numbered([normal("Click "), bold("Upgrade"), normal(" on a higher plan")]),
        h3('"A new board member was elected"'),
        numbered([normal("Go to "), bold("User Management"), normal(" tab")]),
        numbered([normal("Find the member, click "), bold("Edit")]),
        numbered([normal("Change role to "), bold("Board Member")]),
        numbered([normal("Toggle "), bold("HOA Officer"), normal(" on, enter position")]),
        numbered("Save changes"),
      ],
    }],
  });
}

// ── SUPER ADMIN GUIDE ──

function buildSuperAdminGuide() {
  return new Document({
    numbering: { config: [{ reference: "default-numbering", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 360, hanging: 360 }}}}]}]},
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        title("KithGrid Super Administrator Guide"),
        subtitle("For platform operators who manage all communities (tenants) across the entire KithGrid platform."),

        h2("Access"),
        para(code("/super-admin")),
        para(normal("Super admin access is granted by email allowlist configured in "), code("app/actions/super-admin.ts"), normal(" and the "), code("SUPER_ADMIN_EMAIL"), normal(" environment variable.")),

        separator(),
        h2("Console Overview"),
        para(normal("Two view modes:")),
        numbered([bold("Tenants"), normal(" — create, configure, and manage communities")]),
        numbered([bold("Usage Tracking"), normal(" — platform-wide analytics and per-community stats")]),
        para(bold("Sign Out"), normal(" and "), bold("Add Tenant"), normal(" buttons always visible in header.")),

        separator(),
        h2("Tenants View"),
        h3("Tenant Cards"),
        bullet([bold("Community name"), normal(" and ID (truncated UUID)")]),
        bullet([bold("Slug"), normal(" (URL handle)")]),
        bullet([bold("Active/Disabled"), normal(" status toggle")]),
        bullet([bold("Current plan"), normal(" (Starter 100, Growth 250, Pro 500)")]),

        h3("Creating a New Tenant"),
        numbered([normal("Click "), bold("Add Tenant")]),
        numbered([normal("Enter "), bold("Community Name"), normal(" and "), bold("Slug")]),
        numbered([normal("Click "), bold("Create Tenant")]),
        para(normal("Created with: Starter plan, all modules enabled, Indigo branding, "), bold("14-day free trial"), normal(".")),

        h3("Inviting the First Administrator"),
        numbered([normal("Click the "), bold("Invite"), normal(" icon on the tenant card")]),
        numbered([normal("Enter the administrator's "), bold("email address")]),
        numbered([normal("Click "), bold("Generate Invitation")]),
        numbered([normal("A "), bold("6-character code"), normal(" is generated")]),
        numbered([normal("Share securely — they use it at "), code("/join"), normal(" with Admin privileges")]),

        h3("Module Configuration"),
        makeTable(["Module", "Controls"], [
          ["Marketplace", "Buy/sell/trade listings"],
          ["Resources", "Shared facility and equipment reservations"],
          ["Events", "Community event calendar and RSVPs"],
          ["Documents", "HOA document storage"],
          ["Forum", "Community discussion board"],
          ["Messages", "Direct messaging between members"],
          ["Services", "Service provider directory"],
          ["Local Guide", "Local business and restaurant directory"],
          ["Emergency", "SOS button and emergency contact system"],
        ]),

        h3("Branding"),
        bullet([bold("Primary Color"), normal(" — main UI accent")]),
        bullet([bold("Secondary Color"), normal(" — sidebar and secondary elements")]),
        bullet([bold("Logo URL"), normal(" — community logo image")]),

        h3("Tenant Status"),
        bullet([bold("Active"), normal(" (green) — fully operational")]),
        bullet([bold("Disabled"), normal(" (grey) — suspended")]),

        h3("Simulate Login"),
        para(normal("Click "), bold("Simulate Login"), normal(" to enter any tenant's dashboard as if you were a member. Useful for testing.")),

        h3("Exporting & Deleting"),
        bullet([bold("Export"), normal(" — download tenant config as JSON")]),
        bullet([bold("Delete"), normal(" — permanently remove community and all data (irreversible)")]),

        separator(),
        h2("Usage Tracking View"),
        h3("Platform Totals"),
        makeTable(["Metric", "What it counts"], [
          ["Communities", "Total tenant count"],
          ["Total Members", "Sum of all members"],
          ["Forum Posts", "Total posts platform-wide"],
          ["Events", "Total events created"],
          ["Listings", "Total marketplace items"],
          ["Messages", "Total direct messages sent"],
        ]),

        h3("Per-Community Usage Table"),
        makeTable(["Column", "Description"], [
          ["Community", "Name and slug"],
          ["Plan", "Current plan tier"],
          ["Status", "active, trial, or expired"],
          ["Members", "Current count / plan max"],
          ["Usage", "Progress bar with percentage"],
          ["Posts", "Forum post count"],
          ["Events", "Event count"],
          ["Listings", "Marketplace listing count"],
          ["Messages", "Direct message count"],
          ["Invites", "Total invitations generated"],
          ["Trial Ends", "Trial expiration date"],
        ]),

        h3("Usage Bar Colors"),
        bullet([bold("Indigo"), normal(" (< 70%) — healthy")]),
        bullet([bold("Amber"), normal(" (70-89%) — approaching limit")]),
        bullet([bold("Red"), normal(" (90%+) — near or at capacity")]),

        separator(),
        h2("Plan & Trial System"),
        h3("Plans"),
        makeTable(["Plan", "Slug", "Max Homes"], [
          ["Starter", "starter_100", "100"],
          ["Growth", "growth_250", "250"],
          ["Pro", "pro_500", "500"],
        ]),

        h3("Free Trial"),
        bullet([normal("Every new community starts with a "), bold("14-day free trial")]),
        bullet("All features available during trial"),
        bullet([bold("Trial banner"), normal(" appears in dashboard")]),
        bullet([normal("When expired: new joins/invites "), bold("blocked"), normal("; existing members retain access")]),

        h3("Plan Enforcement"),
        numbered([bold("Invitation creation"), normal(" — blocked when at capacity")]),
        numbered([bold("Join flow"), normal(" — blocked when community is full")]),

        separator(),
        h2("Common Operations"),
        h3('"A new HOA wants to onboard"'),
        numbered([normal("Click "), bold("Add Tenant"), normal(" and create the community")]),
        numbered([normal("Click "), bold("Invite"), normal(" and generate an admin code")]),
        numbered("Send the code to the HOA's designated administrator"),
        numbered([normal("They sign up at "), code("/join"), normal(" and start inviting residents")]),

        h3('"A community\'s trial expired"'),
        numbered([normal("Use "), bold("Simulate Login"), normal(" to enter their dashboard")]),
        numbered([normal("Navigate to Admin Console > "), bold("Plan & Billing")]),
        numbered("Select the appropriate plan"),

        h3('"Check which communities are running low"'),
        numbered([normal("Switch to "), bold("Usage Tracking"), normal(" view")]),
        numbered("Red bars indicate communities near their limit"),
        numbered("Contact admins about upgrading"),

        h3('"A community needs to be shut down"'),
        numbered([normal("First consider "), bold("disabling"), normal(" (reversible)")]),
        numbered([normal("If permanent, click "), bold("Delete"), normal(" and confirm")]),

        separator(),
        h2("Environment Configuration"),
        makeTable(["Variable", "Purpose"], [
          ["SUPER_ADMIN_EMAIL", "Additional super admin email (beyond hardcoded list)"],
          ["DATABASE_URL", "PostgreSQL connection string (required)"],
        ]),
        para(normal("The super admin allowlist is in "), code("app/actions/super-admin.ts"), normal(". Add emails to the SUPER_ADMINS array or set the env variable.")),
      ],
    }],
  });
}

// ── GENERATE ALL ──

async function main() {
  const guides = [
    { name: "user-guide", build: buildUserGuide },
    { name: "admin-guide", build: buildAdminGuide },
    { name: "super-admin-guide", build: buildSuperAdminGuide },
  ];

  for (const { name, build } of guides) {
    const doc = build();
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(`docs/${name}.docx`, buffer);
    console.log(`Generated docs/${name}.docx`);
  }
}

main().catch(console.error);

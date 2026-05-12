import type {
  CaseStudy,
  ChoiceQuestion,
  DragDropQuestion,
  MultiSelectQuestion,
  YesNoQuestion,
} from "../types/exam";
import { ensurePromptComplexity } from "./questionComplexity.ts";
import { rebalanceChoiceOptionIds } from "./rebalanceChoiceOptionIds.ts";

const choiceQuestion = (question: Omit<ChoiceQuestion, "active">): ChoiceQuestion => ({
  active: true,
  ...rebalanceChoiceOptionIds(ensurePromptComplexity(question)),
});

const multiSelectQuestion = (
  question: Omit<MultiSelectQuestion, "active">,
): MultiSelectQuestion => ({
  active: true,
  ...ensurePromptComplexity(question),
});

const yesNoQuestion = (question: Omit<YesNoQuestion, "active">): YesNoQuestion => ({
  active: true,
  ...ensurePromptComplexity(question),
});

const dragDropQuestion = (
  question: Omit<DragDropQuestion, "active">,
): DragDropQuestion => ({
  active: true,
  ...ensurePromptComplexity(question),
});

export const finalPrepQuestions = [
  //  D1: Identities & Governance 

  choiceQuestion({
    id: "Q2301",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum Corp",
    scenario: "Adatum's production subscription has a permanent Owner assignment for a security architect (User1). A new security policy mandates: (1) Owner must be eligible (not permanent), (2) activations require approval from two independent approvers (no single approver can approve), (3) max activation duration is 4 hours, (4) all activations must be logged for SOX audit compliance with justification required, and (5) if User1 attempts to activate during change-freeze windows (Dec 24-27, Jul 4 weekend), activation must be denied unless emergency override is invoked (which requires CRQ + CISO approval via a separate 24-hour approval chain). The system must prevent approval-delay workarounds by tracking approval request timestamps and blocking repeat requests within 15 minutes.",
    stem: "Which combination of PIM configurations enforces all five security requirements AND prevents approval-delay exploitation during change-freeze?",
    subtopic: "Manage Microsoft Entra Privileged Identity Management",
    referenceTopic: "Microsoft Entra PIM eligible assignments, multi-stage approvals, time-bound windows, and audit logging",

    hint: "PIM supports eligible assignments (requirement 1), approval workflows (requirement 2), max duration (requirement 3), and audit logging (requirement 4). But does PIM have a change-freeze window feature? Can PIM enforce CRQ + CISO approval via separate workflows? How would you layer PIM with Azure Policy or Conditional Access to handle change-freeze denial + emergency override? What prevents an approver from rapidly re-requesting to bypass multi-approver gates?",
    options: [
      {
        id: "A",
        text: "Remove permanent Owner, make User1 eligible, configure two-approver requirement, set 4-hour max duration, and enable all PIM audit logs. PIM will block activations during change-freeze automatically.",
        rationale: "Incorrect. PIM does not have built-in change-freeze window enforcement. PIM audit logs satisfy requirement 4, but PIM alone cannot deny activations on specific calendar dates or enforce CRQ approval. You must layer policy or external controls."
      },
      {
        id: "B",
        text: "Remove permanent Owner, create eligible assignment, configure two-approver requirement, 4-hour max duration, PIM audit logs enabled, AND layer an Azure Policy with Deny effect that triggers during change-freeze dates (Dec 24-27, Jul 4 weekend). Create a separate CRQ workflow in ServiceNow (outside PIM) for emergency overrides; integrate CRQ approval as a prerequisite before PIM emergency-override flag is set.",
        rationale: "Correct. This layers PIM for multi-approver eligible activation (1, 2, 3, 4) with Azure Policy to enforce time-bound denial (5 partial). PIM audit logs + justification fields cover audit trails. CRQ + CISO approval via external workflow prevents single-gating and ensures change governance integrity. However, this does NOT fully prevent approval-delay exploitation within PIM."
      },
      {
        id: "C",
        text: "Create a Conditional Access policy blocking Owner role activation during change-freeze dates, configure PIM two-approver requirement, 4-hour max duration, PIM audit logs, and set a 15-minute re-request throttle in PIM settings.",
        rationale: "Incorrect. Conditional Access blocks sign-in; it does not prevent role ACTIVATION within PIM. Conditional Access and PIM operate at different control planes (sign-in vs. role activation). There is no PIM 're-request throttle' setting; throttling must be implemented in code or policy if required."
      },
      {
        id: "D",
        text: "Remove permanent Owner, make eligible, enable one-approver workflow (not two), 4-hour max duration, PIM audit logs, and Azure Policy blocks activations during change-freeze.",
        rationale: "Incorrect. One-approver workflow violates requirement 2 (must be two independent approvers). A single approver can become a bottleneck and introduces a single point of failure for approval decisions."
      },
    ],
    correctOptionId: "B",
    explanation: "Option B correctly layers PIM (eligible role + two-approver requirement + audit logging + 4-hour max duration) with Azure Policy to enforce time-bound denial. The separate CRQ + CISO approval workflow (outside PIM) satisfies the change-freeze emergency override requirement. This multi-layer approach recognizes that PIM alone cannot enforce calendar-based change-freeze windows or CRQ integration; those must come from policy or external processes. Option A assumes PIM has built-in change-freeze support (it doesn't). Option C conflates Conditional Access (sign-in) with PIM (activation). Option D violates the two-approver requirement. This tests understanding of PIM's boundaries and how to layer it with policy and external systems to achieve end-to-end governance."
  }),

  choiceQuestion({
    id: "Q2302",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Tailwind Traders",
    scenario: "Tailwind Traders enforces multiple Conditional Access policies: (1) Device must be compliant to access Azure portal (enforced for all users), (2) MFA required to access Azure Storage (enforced for all users), (3) High-risk sign-ins must re-authenticate with MFA (Risk-Based Conditional Access enabled). Developer User2 works on a corporate Windows 11 device enrolled in Intune. After a Windows feature update, Intune temporarily marks the device 'Not compliant' for ~30 minutes, blocking portal access. Simultaneously, the update triggers a transient network anomaly, causing Conditional Access to flag the sign-in as 'medium risk' (requiring MFA re-auth). User2 must continue working during this 30-minute window, but any relaxation must NOT bypass MFA (which is mandatory for Storage access) and must NOT disable the high-risk check permanently. Additionally, the compliance grace period must NOT apply to User3 (a contractor) who should NEVER have grace period exemptions per security policy. How do you allow User2 through the transient compliance gap while maintaining MFA enforcement and contractor protection?",
    stem: "Which combination of Intune and Conditional Access configurations satisfy: grace period for User2 (not User3), transient compliance gap handling, MFA preservation, and risk-based re-auth continuation?",
    subtopic: "Manage Conditional Access policies and Intune device compliance",
    referenceTopic: "Intune compliance grace periods, Conditional Access policy layering, user/group exclusions, MFA enforcement, risk-based CA",

    hint: "Intune grace periods are device-config settings (apply to ALL devices in that config profile). How do you selectively apply grace period to User2's device but NOT User3's? Can you assign different Intune compliance profiles per user group? If User2 has grace period and User3 doesn't, both must still satisfy MFA (Storage policy). Can Conditional Access policies be ranked or layered so grace-period mitigation doesn't disable risk-based checks? What's the minimal policy relaxation?",
    options: [
      {
        id: "A",
        text: "Configure a compliance grace period in Intune (applies to all devices globally) so User2's device remains compliant for 60 minutes during update. This allows portal access. Exclude User3 from the Conditional Access portal-access policy to prevent grace period from affecting contractor security.",
        rationale: "Incorrect. Globally enabling grace period affects ALL devices, including User3's contractor device. Excluding User3 from the portal-access policy removes ALL access controls for contractors, which is overly permissive. User3 should remain subject to compliance checks, just without grace period exemption."
      },
      {
        id: "B",
        text: "Assign User2 to a named location excluded from the Conditional Access portal-access policy. This bypasses device compliance check for User2 during update.",
        rationale: "Incorrect. Named-location exclusion disables the portal-access policy entirely for User2 (including device compliance, even after the 30-minute window). This is over-relaxation. Also, it does not address the simultaneous medium-risk sign-in flag."
      },
      {
        id: "C",
        text: "Create a device-configuration profile targeting User2's device group that enables a 60-minute compliance grace period. Assign User3 to a separate profile WITHOUT grace period. Keep all three CA policies active (device compliance, MFA for Storage, risk-based re-auth). Grace period applies only to User2's device; User3 remains unaffected. MFA policies and risk-based CA remain in effect for all users.",
        rationale: "Correct. Group-based device profiles allow selective grace period assignment: User2's profile has grace (60 min), User3's profile does not. Conditional Access policies remain layered and active. MFA for Storage is still enforced. Risk-based re-auth evaluates transient risk flags; the grace period handles only the compliance check. This achieves minimal relaxation with maximum protection."
      },
      {
        id: "D",
        text: "Add User2 to the Intune device-compliance policy's exclusion list so User2's device is not evaluated for compliance. Remove User3 from all Conditional Access policies during the 30-minute window.",
        rationale: "Incorrect. Excluding User2 from compliance checks removes accountability for security. Removing User3 from CA policies during the incident window disables all controls for a contractor, violating security baseline."
      },
    ],
    correctOptionId: "C",
    explanation: "This tests understanding of Intune device profiles (group-based, selective grace period) vs Conditional Access policies (layered, all remain active). The key insight is that grace period is a device-CONFIG setting (scoped to device groups), not a policy-level blanket exemption. By assigning User2 and User3 to different compliance profiles, you grant selective grace period WITHOUT affecting other policies. MFA remains mandatory. Risk-based re-auth continues to evaluate transient signs of compromise. This demonstrates minimal-relaxation thinking: unblock the legitimate user for transient issues while maintaining all other security controls and protecting contractors from exemptions.",
  }),

  choiceQuestion({
    id: "Q2303",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso Ltd",
    scenario: "Your organization collaborates with external partners by inviting them as guest users to Microsoft Entra ID. You invite an external user (guest@partner.com) from a partner tenant. The guest user receives the invitation email but takes no action for several weeks and the redemption link expires. The user now needs to access a shared SharePoint site.",
    stem: "What is the most efficient way to let the guest user access the SharePoint site?",
    subtopic: "Manage external identities and guests",
    referenceTopic: "Microsoft Entra B2B  invitation redemption and resend",

    hint: "Expired B2B invitation links can be resent directly from the guest user's profile in Microsoft Entra ID without needing to delete and re-invite. Look for the 'Resend Invitation' action.",
    options: [
      {
        id: "A",
        text: "Delete the guest account and re-invite the user to generate a new redemption link.",
        rationale: "Partially correct but unnecessarily destructive. Deleting removes any existing group memberships and access assignments on the account."
      },
      {
        id: "B",
        text: "In Microsoft Entra ID, locate the guest user object, select 'Resend invitation', and send a new redemption link.",
        rationale: "Correct. Microsoft Entra allows resending an invitation from the user's profile page, generating a new redemption link without deleting the account or losing existing assignments."
      },
      {
        id: "C",
        text: "Add the guest user's UPN directly to the SharePoint site members list; the platform will automatically send a new invitation.",
        rationale: "Incorrect. SharePoint cannot trigger Microsoft Entra B2B reinvitation for an already-created but unredeemed guest object."
      },
      {
        id: "D",
        text: "Ask the guest user to navigate directly to the SharePoint URL; the system will prompt them to redeem the invitation automatically.",
        rationale: "Incorrect. An expired invitation link cannot be self-redeemed. The tenant must resend the invitation."
      },
    ],
    correctOptionId: "B",
    explanation: "When a guest redemption link expires, the invitation can be resent from the user's object in Microsoft Entra ID without deleting and re-creating the account. This preserves any existing group memberships and role assignments configured on the guest object."
  }),

  choiceQuestion({
    id: "Q2304",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Fabrikam Inc",
    scenario: "Fabrikam has Root > Corp > Prod hierarchy. A Deny policy at Corp blocks public IP creation. One production project has a formally approved exception to deploy exactly one public IP in a dedicated resource group for 21 days during a migration. Governance requires that: all other resources remain blocked, exemption scope is minimal, and auditors can see that this was intentional and time-bounded.",
    stem: "Which approach allows this one approved deployment while keeping enforcement intact everywhere else?",
    subtopic: "Manage Azure Policy",
    referenceTopic: "Azure Policy exemptions and exclusions",

    hint: "Changing policy effect or assignment scope is broad and risky. Look for a targeted, auditable exception mechanism tied to the existing assignment and scoped to the smallest necessary boundary.",
    options: [
      {
        id: "A",
        text: "Create a policy exemption (Waiver) referencing the Deny assignment and scope it only to the approved resource group (or specific resource), with an expiration date.",
        rationale: "Correct. This is a surgical, auditable exception. It preserves Deny enforcement for all other scopes and supports time-bounded governance."
      },
      {
        id: "B",
        text: "Temporarily move the subscription outside Corp, deploy the public IP, then move it back.",
        rationale: "Incorrect. This bypasses all inherited governance controls temporarily and introduces major operational and compliance risk."
      },
      {
        id: "C",
        text: "Switch the policy effect from Deny to Audit during deployment and revert afterward.",
        rationale: "Incorrect. This disables enforcement broadly across scope during the change window, not just for the approved exception."
      },
      {
        id: "D",
        text: "Assign an Append policy at Prod to override the Deny behavior for that project.",
        rationale: "Incorrect. Append does not override Deny in policy evaluation; Deny still blocks creation."
      },
    ],
    correctOptionId: "A",
    explanation: "A policy exemption is the intended mechanism for intentional, narrow deviations from a policy assignment. By using Waiver with minimal scope and expiration, you preserve enterprise Deny enforcement while allowing only the approved migration exception. Broad alternatives (scope moves, effect changes) undermine governance and create audit risk."
  }),

  choiceQuestion({
    id: "Q2305",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario: "You are creating a custom RBAC role for a team of database administrators. The role must allow all actions on SQL databases under Microsoft.Sql/servers/databases/* but must explicitly block the ability to delete a SQL server (Microsoft.Sql/servers/delete) even though the wildcard would normally include it.",
    stem: "Which JSON structure in the role definition achieves this?",
    subtopic: "Create and manage custom RBAC roles",
    referenceTopic: "Custom role definitions  Actions, NotActions, and DataActions",

    hint: "Use NotActions to remove specific operations from the permissions granted by wildcards in Actions. This allows broad permissions while excluding sensitive operations like delete.",
    options: [
      {
        id: "A",
        text: "Actions: ['Microsoft.Sql/servers/databases/*'], NotActions: ['Microsoft.Sql/servers/delete']",
        rationale: "Correct. NotActions are subtracted from Actions at evaluation time. Listing the delete action in NotActions removes it from the effective permissions even though the wildcard in Actions would otherwise include parent-scope operations."
      },
      {
        id: "B",
        text: "Actions: ['Microsoft.Sql/servers/databases/*', 'Microsoft.Sql/servers/delete'], NotActions: ['Microsoft.Sql/servers/delete']",
        rationale: "Incorrect in reasoning  explicitly listing an action and then negating it is redundant and potentially confusing."
      },
      {
        id: "C",
        text: "Actions: ['Microsoft.Sql/*'], DenyAssignments: ['Microsoft.Sql/servers/delete']",
        rationale: "Incorrect. DenyAssignments is a separate Azure RBAC feature that cannot be authored inside a custom role definition; deny assignments are created independently."
      },
      {
        id: "D",
        text: "Actions: ['Microsoft.Sql/servers/databases/*'], Conditions: [{'delete': 'false'}]",
        rationale: "Incorrect. RBAC conditions (ABAC) are attribute-based and do not use Boolean flags to block actions; they filter permissions based on resource attributes."
      },
    ],
    correctOptionId: "A",
    explanation: "In Azure RBAC custom roles, NotActions subtracts specific operations from the broad permissions granted by Actions. An operation listed in NotActions is removed from the effective permission set, even if a wildcard in Actions would otherwise grant it. This is the correct mechanism to allow broad SQL database management while blocking server-level deletion."
  }),

  choiceQuestion({
    id: "Q2306",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "City Power and Light",
    scenario: "The finance team wants to receive an email alert when monthly Azure spending reaches 80% of their budgeted limit of $10,000. The budget threshold and alert must apply only to the Finance resource group and must not trigger for spending in other resource groups within the same subscription.",
    stem: "Where in the Azure portal should you create the budget?",
    subtopic: "Configure Azure Cost Management and billing",
    referenceTopic: "Azure Cost Management  budget scope and alert thresholds",

    hint: "Azure Cost Management supports budgets at the resource group scope. Navigate to the RG and access Cost Management > Budgets to scope the alert precisely.",
    options: [
      {
        id: "A",
        text: "At the subscription scope in Cost Management, with a filter scoped to the Finance resource group.",
        rationale: "Partially workable but not the cleanest approach. Budget filters restrict cost data but the budget itself still belongs to the subscription scope."
      },
      {
        id: "B",
        text: "Navigate to the Finance resource group, open Cost Management, and create a budget directly at the resource group scope.",
        rationale: "Correct. Azure Cost Management supports budget creation at the resource group scope. Creating the budget within the resource group scopes it directly and accurately."
      },
      {
        id: "C",
        text: "Create the budget at the Management Group scope and assign it to Finance.",
        rationale: "Incorrect. Budgets cannot be scoped to individual resource groups from the management group level; they apply to the full management group hierarchy."
      },
      {
        id: "D",
        text: "Create a billing alert in the Azure Billing section of the subscription for the Finance resource group.",
        rationale: "Incorrect. Billing alerts apply to subscription-level invoice amounts, not to individual resource group spending, and lack the threshold percentage feature."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Cost Management budgets support resource group scope. By creating the budget inside the Finance resource group's Cost Management blade, the $10,000 budget and 80% alert threshold apply precisely to that resource group's spending without affecting other parts of the subscription."
  }),

  multiSelectQuestion({
    id: "Q2307",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "Litware Inc",
    scenario: "Your organization has deployed Microsoft Entra ID Access Reviews for a security group that grants access to a sensitive application. The access review is currently configured with reviewers set to 'Group owners'. You need to ensure that if a reviewer takes no action on an access review before it expires, the review result still enforces a least-privilege outcome for unreviewed users.",
    stem: "Which TWO configurations should you apply to the access review to achieve this?",
    subtopic: "Manage identity governance and access reviews",
    referenceTopic: "Entra ID Access Reviews  auto-apply and reviewer inaction behavior",

    hint: "Two settings control least-privilege outcomes: (1) set non-response to 'Remove access' to revoke unreviewed access, and (2) enable 'Auto apply' to enforce decisions automatically.",
    options: [
      {
        id: "A",
        text: "Set 'If reviewers don't respond' to 'Remove access'.",
        rationale: "Correct. Configuring non-response to remove access ensures that unreviewed users lose access at review expiry, enforcing least privilege when reviewers are inactive."
      },
      {
        id: "B",
        text: "Enable 'Auto apply results to resource' so that review decisions are applied to the group automatically at review end.",
        rationale: "Correct. Without auto-apply, review decisions (including the non-response policy) are only recommendations; manual application is still required. Enabling auto-apply enforces the decisions automatically."
      },
      {
        id: "C",
        text: "Set the review duration to 1 day to minimize the window where access remains unreviewed.",
        rationale: "Incorrect. Shortening the review period is a tuning preference, not a mechanism for handling non-response or enforcing access removal."
      },
      {
        id: "D",
        text: "Set 'If reviewers don't respond' to 'No change'.",
        rationale: "Incorrect. 'No change' means unreviewed users retain access, which violates the least-privilege requirement."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "Achieving least-privilege enforcement on expired reviews requires two settings working together: (1) configuring non-response to remove access so that inaction results in revocation, and (2) enabling auto-apply so that both review decisions and the non-response policy are applied to the resource at review end without manual intervention."
  }),

  choiceQuestion({
    id: "Q2308",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Alpine Ski House",
    scenario: "Your organization wants to use Microsoft Entra Privileged Identity Management (PIM) to manage eligible role assignments for Azure resources, including just-in-time activation with time limits and approval workflows. You need to confirm the minimum Microsoft Entra ID license required to enable PIM for both Microsoft Entra directory roles and Azure resource roles.",
    stem: "Which license is required?",
    subtopic: "Manage Microsoft Entra Privileged Identity Management",
    referenceTopic: "Microsoft Entra PIM  licensing requirements",

    hint: "PIM for both directory roles and Azure resource roles requires Microsoft Entra ID P2 licensing. P1 includes Conditional Access but not PIM's JIT and approval capabilities.",
    options: [
      {
        id: "A",
        text: "Microsoft Entra ID Free",
        rationale: "Incorrect. Entra ID Free provides basic identity features but does not include PIM."
      },
      {
        id: "B",
        text: "Microsoft Entra ID P1",
        rationale: "Incorrect. P1 includes Conditional Access and self-service group management but not PIM."
      },
      {
        id: "C",
        text: "Microsoft Entra ID P2",
        rationale: "Correct. PIM for both Microsoft Entra roles and Azure resource roles requires Microsoft Entra ID P2 (or Microsoft Entra ID Governance)."
      },
      {
        id: "D",
        text: "Microsoft 365 E3",
        rationale: "Incorrect. Microsoft 365 E3 includes Entra ID P1 but not P2; PIM is not included."
      },
    ],
    correctOptionId: "C",
    explanation: "Microsoft Entra Privileged Identity Management (PIM) for both Microsoft Entra directory roles (such as Global Administrator) and Azure resource roles is a premium feature requiring Microsoft Entra ID P2 licensing (or the bundled Microsoft Entra ID Governance add-on). P1 licensing covers Conditional Access and self-service capabilities but does not include PIM's just-in-time, approval-based role activation features."
  }),

  choiceQuestion({
    id: "Q2309",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Woodgrove Bank",
    scenario: "Woodgrove Bank mandates that every VM must stream platform logs and metrics to a central Log Analytics workspace. New VMs must be configured automatically, and existing noncompliant VMs must be remediated at scale. The policy should not just report drift; it must create missing diagnostic settings child resources when absent.",
    stem: "Which policy effect is required for this design?",
    subtopic: "Manage Azure Policy",
    referenceTopic: "Azure Policy effects  DeployIfNotExists vs Modify vs AuditIfNotExists",

    hint: "Ask which effect can both evaluate existence of related resources and deploy the missing child resource through remediation tasks.",
    options: [
      {
        id: "A",
        text: "AuditIfNotExists",
        rationale: "Incorrect. AuditIfNotExists detects drift but does not deploy missing diagnostic settings."
      },
      {
        id: "B",
        text: "Modify",
        rationale: "Incorrect. Modify can alter request properties/tags but cannot deploy this child resource pattern."
      },
      {
        id: "C",
        text: "DeployIfNotExists",
        rationale: "Correct. DeployIfNotExists can create related child resources and supports remediation for existing noncompliant VMs."
      },
      {
        id: "D",
        text: "Append",
        rationale: "Incorrect. Append can enrich request payloads but cannot deploy missing child resources after evaluation."
      },
    ],
    correctOptionId: "C",
    explanation: "This requirement needs enforcement plus deployment. Diagnostic settings are child resources, so reporting-only effects are insufficient. DeployIfNotExists is the correct effect because it can evaluate presence and deploy missing settings through remediation, covering both new and existing VMs without manual repair."
  }),

  yesNoQuestion({
    id: "Q2310",
    domain: "D1",
    type: "yes-no",
    difficulty: "hard",
    company: "Contoso",
    scenario: "Contoso operates a multi-tier IT infrastructure: (1) Corporate HQ runs Windows 11 devices managed by both on-premises AD DS and Entra ID (hybrid-joined). (2) Remote offices use personal devices enrolled in Entra ID but NOT joined to AD DS (registered). (3) Cloud-only teams use Entra-joined devices managed exclusively by Intune. Contoso's GPO strategy requires: Security baseline GPOs (e.g., BitLocker, credential guard) apply to HQ hybrid devices. Cloud-only teams use Intune device configuration profiles (no AD GPOs). Regional compliance policies require: HQ devices must receive quarterly security updates via AD GPO or Intune (whichever is configured). Remote personal devices can NEVER receive enforced policies (advisory only). For an Entra-joined device operating in the cloud-only team, evaluate each statement considering BOTH the device join TYPE and the GPO/policy applicability constraints.",
    stem: "For each statement, select Yes if the statement is true (considering the operational context). Otherwise, select No.",
    subtopic: "Manage device identities in Microsoft Entra ID",
    referenceTopic: "Microsoft Entra device join types (registered vs joined vs hybrid), GPO vs Intune policy applicability, policy applicability scope",

    hint: "Hybrid-joined = both AD DS + Entra ID (receives GPOs + Intune). Entra-joined cloud-only = Entra ID + Intune ONLY (cannot receive AD GPOs). Registered = Entra ID only, personal BYOD. For Entra-joined cloud device: Can it receive on-premises AD GPOs natively? If it IS cloud-managed by Intune, does it NEED AD GPOs or use Intune profiles instead? Consider: Does joining type = automatic GPO eligibility, or does management context override join type?",
    statements: [
      {
        id: "S1",
        text: "A hybrid-joined device at Contoso HQ is simultaneously managed by on-premises AD DS (for GPO application) and Entra ID + Intune (for cloud policies). If both AD GPO and Intune policy target the same setting (e.g., BitLocker), both are applied and policies are additive (more restrictive setting wins).",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "An Entra-joined device in Contoso's cloud-only team can natively receive group policy objects from an on-premises domain controller without additional configuration (such as installing a connector or hybrid join).",
        answer: "No"
      },
      {
        id: "S4",
        text: "For a cloud-only team, using Entra-joined devices managed by Intune profiles alone (no on-premises AD) satisfies the requirement for security baseline enforcement (BitLocker, credential guard) WITHOUT requiring hybrid join or on-premises GPO infrastructure.",
        answer: "Yes"
      },
    ],
    explanation: "S1 (True): Hybrid-joined devices receive both AD GPO and Intune policies. When policies target the same setting, the most restrictive applies. S2 (False): Entra-joined devices (cloud-only, not hybrid) are managed exclusively by Intune; they do NOT connect to on-premises AD DCs and cannot receive AD GPOs natively. S4 (True): Intune device configuration profiles provide security baselines equivalent to AD GPOs (BitLocker, Defender, credential guard, etc.). For cloud-only teams, Intune alone is sufficient without requiring hybrid join complexity. This scenario tests understanding of device JOIN TYPE vs MANAGEMENT CONTEXT: hybrid-joined devices bridge on-premises and cloud; cloud-only joined devices are Intune-managed only. The key insight: device join type determines WHICH management systems can reach it (on-premises AD vs cloud Intune), and management context determines policy applicability scope."
  }),

  dragDropQuestion({
    id: "Q2311",
    domain: "D1",
    type: "drag-drop",
    difficulty: "hard",
    company: "Fabrikam",
    scenario: "You are creating a new custom Azure RBAC role from scratch. The role must be available for assignment on a specific management group. You have already identified the required permissions.",
    stem: "Arrange the steps in the correct order to create and assign the custom role.",
    subtopic: "Create and manage custom RBAC roles",
    referenceTopic: "Custom role authoring workflow  definition, assignable scope, assignment",

    hint: "RBAC role creation workflow: first define the JSON with Actions/NotActions and assignable scopes, then submit it to create the role definition, then assign it to principals.",
    availableItems: [
    "Assign the custom role to the target security group at the management group scope",
    "Create the custom role definition using the JSON file",
    "Define the permissions (Actions/NotActions) and set the assignable scope to the management group in the role JSON"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: [
      "Define the permissions (Actions/NotActions) and set the assignable scope to the management group in the role JSON",
      "Create the custom role definition using the JSON file",
      "Assign the custom role to the target security group at the management group scope",
    ],
    explanation: "You must first author the complete role definition JSON (including assignable scopes), then submit it to create the role definition in Azure, and only then can you assign the newly created role to a principal at the management group scope."
  }),

  //  D2: Storage 

  choiceQuestion({
    id: "Q2312",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Tailwind Traders",
    scenario: "You are managing an Azure Blob Storage account. A lifecycle management policy must move blobs from the Hot tier to the Cool tier if they have not been modified for 30 days, and then move them to Archive tier if they have not been modified for 90 days. A blob was last modified 45 days ago.",
    stem: "What is the current access tier of the blob after the lifecycle policy has been evaluated today?",
    subtopic: "Implement Azure Blob Storage lifecycle management",
    referenceTopic: "Blob lifecycle policy  tier transition based on last-modified date",

    hint: "Lifecycle rules evaluate sequentially based on modification date. A blob modified 45 days ago triggers the 30-day Cool rule but not the 90-day Archive rule. Check the rule order.",
    options: [
      {
        id: "A",
        text: "Hot",
        rationale: "Incorrect. The blob was last modified 45 days ago, which satisfies the 30-day condition to transition to Cool."
      },
      {
        id: "B",
        text: "Cool",
        rationale: "Correct. The blob was last modified 45 days ago. This satisfies the >=30-day rule to move to Cool but does not yet satisfy the >=90-day rule to move to Archive."
      },
      {
        id: "C",
        text: "Archive",
        rationale: "Incorrect. The Archive rule triggers at 90 days without modification; the blob is only 45 days old."
      },
      {
        id: "D",
        text: "Cold",
        rationale: "Incorrect. Cold tier is a valid tier but is not part of the defined lifecycle policy rules in this scenario."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Blob lifecycle rules are evaluated in order. The 30-day-without-modification rule fires first, moving the blob to Cool. The 90-day rule for Archive has not been met at 45 days. Therefore the blob is currently in the Cool tier."
  }),

  choiceQuestion({
    id: "Q2313",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum Financial",
    scenario: "Adatum Financial is required by regulators to store certain audit logs in Azure Blob Storage with immutable retention that cannot be shortened or the blobs deleted before a mandatory 7-year retention period. The security team also needs to be able to place specific blobs under a legal hold that blocks deletion indefinitely while litigation is ongoing, independently of the 7-year policy.",
    stem: "Which combination of immutability features satisfies both requirements?",
    subtopic: "Implement Azure Blob Storage immutability policies",
    referenceTopic: "Blob immutability  time-based retention policies vs legal holds",

    hint: "Locked time-based retention prevents policy shortening (regulatory compliance). Legal holds are independent and block deletion indefinitely until explicitly cleared (litigation support).",
    options: [
      {
        id: "A",
        text: "A time-based retention policy locked at 7 years for the 7-year requirement, and a legal hold tag for the litigation hold.",
        rationale: "Correct. Locking a time-based retention policy makes it immutable (cannot be reduced or removed). Legal holds operate independently and block deletion until explicitly cleared, satisfying the litigation requirement."
      },
      {
        id: "B",
        text: "A time-based retention policy (unlocked) at 7 years and a separate legal hold tag.",
        rationale: "Incorrect. An unlocked policy can be shortened or deleted by an administrator. Regulators require that the 7-year period cannot be shortened, which requires the policy to be locked."
      },
      {
        id: "C",
        text: "A single legal hold tag set to 7 years for both requirements.",
        rationale: "Incorrect. Legal holds do not expire automatically after a fixed period; they must be manually cleared. They cannot enforce a timed retention requirement."
      },
      {
        id: "D",
        text: "Enable soft delete with a 7-year retention period for the timed requirement, and a legal hold for litigation.",
        rationale: "Incorrect. Soft delete protects against accidental deletion but can be disabled by a storage account administrator. It is not a regulatory immutability control."
      },
    ],
    correctOptionId: "A",
    explanation: "Azure Blob immutability has two complementary mechanisms: time-based retention policies (which can be locked to prevent modification of the retention period) and legal holds (which block deletion independently of time). Locking the time-based policy is the only way to make the 7-year requirement tamper-resistant for regulatory purposes."
  }),

  choiceQuestion({
    id: "Q2314",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Contoso Banking",
    scenario: "A storage account uses customer-managed keys (CMK) stored in Azure Key Vault for blob encryption. The Key Vault is configured with soft-delete and purge protection enabled. A security incident requires immediate revocation of all access to blob data while investigation proceeds.",
    stem: "What is the fastest way to revoke access to the encrypted blob data without permanently destroying data?",
    subtopic: "Configure storage account encryption",
    referenceTopic: "Customer-managed keys  key revocation via Key Vault",

    hint: "Disabling a CMK in Key Vault immediately prevents unwrap operations, making blobs unreadable. Data remains intact; access can be restored by re-enabling the key.",
    options: [
      {
        id: "A",
        text: "Delete the storage account.",
        rationale: "Incorrect. Deleting the storage account destroys the data, which violates the requirement not to permanently destroy data during an investigation."
      },
      {
        id: "B",
        text: "Disable the customer-managed key in Azure Key Vault by setting its status to 'Disabled'.",
        rationale: "Correct. Disabling the key in Key Vault immediately revokes the storage account's ability to use the key for encryption/decryption operations. All existing encrypted blobs become inaccessible until the key is re-enabled, without deleting the data."
      },
      {
        id: "C",
        text: "Rotate the customer-managed key to a new key version.",
        rationale: "Incorrect. Key rotation updates the encryption key but does not revoke access; the storage account will automatically re-wrap the data encryption key using the new version."
      },
      {
        id: "D",
        text: "Remove the Key Vault access policy that grants the storage account's managed identity access to the key.",
        rationale: "Partially correct but slower to take effect. Key Vault access policy changes rely on cached token lifetimes. Disabling the key itself takes effect immediately and is the fastest revocation mechanism."
      },
    ],
    correctOptionId: "B",
    explanation: "Disabling a customer-managed key in Key Vault immediately prevents the storage service from performing unwrap (decrypt) operations on the data encryption key. This makes all CMK-encrypted blobs in the storage account unreadable without deleting any data, enabling investigation while blocking access. The key can be re-enabled to restore access when appropriate."
  }),

  choiceQuestion({
    id: "Q2315",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Litware",
    scenario: "A customer has 200 TB of on-premises data in a datacenter with a 1 Gbps internet connection and no dedicated Azure ExpressRoute link. The team estimates that uploading all data over the internet would take approximately 18 days of continuous transfer. The data must be in Azure Blob Storage within 5 days, and network provisioning lead time is not available.",
    stem: "Which Azure data transfer option should you recommend?",
    subtopic: "Configure Azure import/export and data movement",
    referenceTopic: "Azure Data Box vs online transfer options",

    hint: "For 200 TB in 5 days over 1 Gbps (18 day transfer), Azure Data Box is the only option. ExpressRoute provisioning takes weeks; software optimization cannot overcome bandwidth constraints.",
    options: [
      {
        id: "A",
        text: "Use AzCopy with the --parallel-level flag to maximize upload throughput over the internet.",
        rationale: "Incorrect. Even with maximum parallel transfers and optimized concurrency, the 1 Gbps link remains the fundamental bottleneck. Software-based optimization cannot overcome the network bandwidth constraint for such large-scale one-time migration."
      },
      {
        id: "B",
        text: "Use Azure Data Box to ship the data physically.",
        rationale: "Correct. Azure Data Box is designed for large datasets where network transfer is too slow. Microsoft ships a ruggedized device, the customer copies data to it, and ships it back. A standard Data Box holds 80 TB; two units would be ordered for 200 TB."
      },
      {
        id: "C",
        text: "Use Azure ExpressRoute to increase bandwidth and transfer the data online.",
        rationale: "Incorrect. Provisioning ExpressRoute takes weeks and even a 10 Gbps circuit would require ~44 hours for 200 TB  the provisioning time makes this impossible within a 5-day window."
      },
      {
        id: "D",
        text: "Use Azure File Sync to gradually migrate the data in the background.",
        rationale: "Incorrect. Azure File Sync is a continuous synchronization service for Azure Files; it is not optimized for bulk one-time migrations and would be limited by the same network bottleneck."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Data Box is purpose-built for large-scale bulk migrations where time constraints or limited bandwidth make online transfer infeasible. For 200 TB within 5 days using a 1 Gbps link (18+ days of continuous transfer needed), physical shipment via Data Box is the only viable option. A standard Data Box unit holds 80 TB; multiple units would be ordered for the full 200 TB."
  }),

  choiceQuestion({
    id: "Q2316",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Adatum Corp",
    scenario: "An organization stores critical data in an Azure storage account in East US. The data must survive both a zone failure within East US and a full regional outage. In addition, the storage account must support customer-initiated failover to a secondary region.",
    stem: "Which redundancy option should you select?",
    subtopic: "Configure Azure Storage redundancy",
    referenceTopic: "Storage redundancy  LRS, ZRS, GRS, GZRS, RA-GZRS",

    hint: "GZRS provides the broadest resilience: ZRS protects against zone failures, geo-replication protects against regional outages, and it supports customer-initiated failover.",
    options: [
      {
        id: "A",
        text: "Zone-redundant storage (ZRS)",
        rationale: "Incorrect. ZRS replicates data across availability zones within one region, protecting against zone failures. It does not replicate to a secondary region and therefore does not support regional failover."
      },
      {
        id: "B",
        text: "Geo-redundant storage (GRS)",
        rationale: "Incorrect. GRS replicates data to a secondary region but stores it in a single zone in the primary region. It does not protect against a zone failure in the primary region."
      },
      {
        id: "C",
        text: "Geo-zone-redundant storage (GZRS)",
        rationale: "Correct. GZRS combines ZRS in the primary region (protection against zone failures) with geo-replication to a secondary region (protection against full regional outages) and supports customer-initiated failover."
      },
      {
        id: "D",
        text: "Read-access geo-redundant storage (RA-GRS)",
        rationale: "Incorrect. RA-GRS replicates to a secondary region and provides read access to secondary data, but does not use zone-redundant storage in the primary region."
      },
    ],
    correctOptionId: "C",
    explanation: "GZRS replicates data across three availability zones in the primary region (providing zone resilience) and asynchronously to a secondary region (providing disaster recovery capability). It also supports customer-initiated failover, which is required when the primary region becomes unavailable."
  }),

  multiSelectQuestion({
    id: "Q2317",
    domain: "D2",
    type: "multi-select",
    difficulty: "hard",
    company: "Northwind",
    scenario: "A development team is connecting an Azure App Service application to an Azure Storage account. The security team requires that the storage account must not be accessible over the public internet and that the App Service must connect to the storage account using a private, Azure-internal path. The storage account firewall is currently set to 'Deny all' public traffic.",
    stem: "Which TWO configurations are required to enable the App Service to access the storage account privately?",
    subtopic: "Configure Azure Storage networking",
    referenceTopic: "Azure Storage private endpoints and VNet integration",

    hint: "Private endpoints (private IP in VNet) + VNet Integration (routes app traffic through VNet) together create a fully private path. Private endpoints resolve the service FQDN to the private IP.",
    options: [
      {
        id: "A",
        text: "Create a private endpoint for the storage account in the same virtual network as the App Service VNet integration subnet.",
        rationale: "Correct. A private endpoint gives the storage account a private IP address within a VNet. Traffic from the App Service (via VNet Integration) can then reach the storage account over the private IP."
      },
      {
        id: "B",
        text: "Enable VNet Integration on the App Service and connect it to a subnet in the same virtual network as the private endpoint.",
        rationale: "Correct. Without VNet Integration, the App Service egresses over the public internet. VNet Integration routes outbound traffic from the App Service through a VNet, allowing it to reach the private endpoint."
      },
      {
        id: "C",
        text: "Add the App Service's outbound IP addresses to the storage account firewall's allowed IP list.",
        rationale: "Incorrect. App Service outbound IPs are public IPs, and adding them to the firewall's allowed list routes traffic over the public internet. This contradicts the requirement."
      },
      {
        id: "D",
        text: "Create a service endpoint for the storage account and add the App Service's subnet to the endpoint's allowed networks list.",
        rationale: "Incorrect. Service endpoints keep traffic within the Azure backbone but the traffic still uses the storage account's public endpoint. A private endpoint is required to avoid the public endpoint entirely."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "Private access to Azure Storage from App Service requires two components: (1) a private endpoint that gives the storage account a private IP within a VNet, and (2) VNet Integration on the App Service that routes outbound traffic through that same VNet. Together they create a fully private path from the application to the storage account."
  }),

  yesNoQuestion({
    id: "Q2318",
    domain: "D2",
    type: "yes-no",
    difficulty: "medium",
    company: "Proseware",
    scenario: "You are reviewing Azure File Sync cloud tiering concepts. Evaluate the following statements.",
    stem: "For each statement, select Yes if the statement is true. Otherwise, select No.",
    subtopic: "Configure Azure File Sync",
    referenceTopic: "Azure File Sync  cloud tiering policies",

    hint: "Volume free space policy maintains a percentage threshold. Date policy tiers based on access age. Both operate independently. Recalls don't make files ineligible for re-tiering.",
    statements: [
      {
        id: "S1",
        text: "The volume free space policy tiers files to ensure that the percentage of free space on the local volume is maintained at the configured threshold.",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "The date policy tiers files that have not been accessed within a specified number of days, regardless of volume free space.",
        answer: "Yes"
      },
      {
        id: "S3",
        text: "Files recalled from the cloud by a user are permanently brought back to the local volume and are no longer eligible for tiering.",
        answer: "No"
      },
    ],
    explanation: "Volume free space policy: True  it maintains a minimum free space percentage by tiering files as needed. Date policy: True  it independently tiers files not accessed within a configurable number of days. Recall permanence: False  recalled files can be re-tiered according to policy; a recall is not permanent unless cloud tiering is disabled on the server endpoint."
  }),

  choiceQuestion({
    id: "Q2319",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam",
    scenario: "A developer needs to provide temporary, time-limited access to specific blobs in a storage account container for an external partner. The access must be revocable before the expiry time without rotating the storage account keys. The storage account uses Microsoft Entra authorization.",
    stem: "Which type of Shared Access Signature (SAS) should you create?",
    subtopic: "Generate shared access signatures",
    referenceTopic: "SAS types  service SAS, account SAS, user delegation SAS",

    hint: "User delegation SAS is backed by a short-lived Entra credential. It can be revoked immediately by invalidating the delegation key without rotating storage account keys.",
    options: [
      {
        id: "A",
        text: "Account SAS signed with the storage account key",
        rationale: "Incorrect. An account SAS signed with the storage account key can only be revoked by rotating the key, which would affect all operations using that key."
      },
      {
        id: "B",
        text: "Service SAS signed with the storage account key",
        rationale: "Incorrect. A service SAS signed with the storage account key also cannot be revoked without key rotation unless it references a stored access policy."
      },
      {
        id: "C",
        text: "User delegation SAS signed with a Microsoft Entra credential",
        rationale: "Correct. A user delegation SAS is signed with a Microsoft Entra OAuth token. It can be revoked by revoking the user delegation key without rotating storage account keys, satisfying the revocability requirement."
      },
      {
        id: "D",
        text: "Service SAS that references a stored access policy",
        rationale: "Partially correct  a stored access policy can be modified or deleted to revoke the SAS. However, the scenario specifies the account uses Microsoft Entra authorization, making a user delegation SAS the more architecturally consistent and recommended choice."
      },
    ],
    correctOptionId: "C",
    explanation: "A user delegation SAS is backed by a short-lived Microsoft Entra credential (the user delegation key). It can be revoked immediately by invalidating that delegation key via the Azure Storage management API, without rotating storage account keys. This is the recommended approach for revocable, time-limited external access on accounts using Entra-based authorization."
  }),

  dragDropQuestion({
    id: "Q2320",
    domain: "D2",
    type: "drag-drop",
    difficulty: "medium",
    company: "Contoso",
    scenario: "You are configuring a new Azure Blob Storage lifecycle management rule that will automatically move blobs in a container from Hot to Cool after 30 days, and then delete them after 90 days.",
    stem: "Arrange the steps in the correct order to create the lifecycle management rule.",
    subtopic: "Implement Azure Blob Storage lifecycle management",
    referenceTopic: "Blob lifecycle management  rule creation workflow",

    hint: "Lifecycle management workflow: Navigate to storage account > Lifecycle management, add rules with filter and actions, then save to apply the policy.",
    availableItems: [
    "Save and apply the lifecycle management policy",
    "Navigate to the storage account and open Lifecycle management under Data management",
    "Add a rule, define the filter set (container scope), and configure the action set (tier to Cool at 30 days, delete at 90 days)"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: [
      "Navigate to the storage account and open Lifecycle management under Data management",
      "Add a rule, define the filter set (container scope), and configure the action set (tier to Cool at 30 days, delete at 90 days)",
      "Save and apply the lifecycle management policy",
    ],
    explanation: "You must first navigate to the Lifecycle management blade, then define the rule with its filter and actions, and finally save the policy for it to take effect."
  }),

  //  D3: Compute 

  choiceQuestion({
    id: "Q2321",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum",
    scenario: "You manage a Virtual Machine Scale Set (VMSS) that processes messages from an Azure Storage Queue. During business hours, queue depth can spike to 50,000 messages within minutes. The VMSS is currently set to scale based on VM CPU utilization but this reactive approach causes unacceptable latency. A custom autoscale rule must scale out preemptively when the queue's ApproximateMessageCount exceeds a threshold, before CPU is impacted. You are configuring this external metric-based custom scale rule in Azure Monitor autoscale.",
    stem: "Which metric source and metric name should you select when configuring the custom autoscale rule?",
    subtopic: "Configure Azure Virtual Machine scale sets",
    referenceTopic: "VMSS autoscale  custom metrics from Azure Storage Queue",

    hint: "VMSS can autoscale on external metrics from other Azure resources. For a queue-based workload, select 'Other resource' > Storage Queue and use ApproximateMessageCount metric.",
    options: [
      {
        id: "A",
        text: "Metric source: Virtual Machine Scale Set; Metric name: QueueDepth (custom)",
        rationale: "Incorrect. VMSS does not natively emit a QueueDepth metric. You must target the Storage Queue resource."
      },
      {
        id: "B",
        text: "Metric source: Application Insights; Metric name: requests/count",
        rationale: "Incorrect. Application Insights request count measures HTTP workload, not queue depth."
      },
      {
        id: "C",
        text: "Metric source: Other resource (Storage Account Queue service); Metric name: ApproximateMessageCount",
        rationale: "Correct. Azure Monitor autoscale custom rules can target metrics emitted by other Azure resources. The Azure Storage Queue service emits the ApproximateMessageCount metric, which you reference by selecting the Storage Account as the metric source."
      },
      {
        id: "D",
        text: "Metric source: Azure Service Bus; Metric name: ActiveMessages",
        rationale: "Incorrect. Azure Service Bus ActiveMessages is the equivalent metric for Service Bus queues, not Azure Storage Queues. The workload uses Azure Storage Queue."
      },
    ],
    correctOptionId: "C",
    explanation: "VMSS autoscale in Azure Monitor can use metrics from any monitored Azure resource via external metric-based custom rules, not just the scale set itself. For an Azure Storage Queue, the ApproximateMessageCount metric is emitted by the Storage Account Queue service. By configuring autoscale to trigger on this external metric, the VMSS scales preemptively based on queue depth rather than reactively based on CPU, reducing message processing latency."
  }),

  choiceQuestion({
    id: "Q2322",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Tailwind",
    scenario: "A batch processing workload runs on Azure Spot Virtual Machines. The workload can checkpoint progress every 5 minutes. Occasionally, Azure evicts a Spot VM because capacity is needed. The team wants the VM to be available again as soon as capacity returns, without manual intervention.",
    stem: "Which eviction policy should you configure on the Spot VM?",
    subtopic: "Configure Azure virtual machines",
    referenceTopic: "Spot VMs  eviction policy: Stop/Deallocate vs Delete",

    hint: "Spot VM eviction policies: Deallocate stops the VM (preserves disks) and auto-restarts when capacity returns; Delete removes the VM permanently and requires manual redeploy.",
    options: [
      {
        id: "A",
        text: "Delete",
        rationale: "Incorrect. The Delete eviction policy removes the VM and its associated disks on eviction. The VM cannot automatically restart when capacity returns."
      },
      {
        id: "B",
        text: "Deallocate (Stop)",
        rationale: "Correct. The Deallocate eviction policy stops and deallocates the VM (preserving the disks) on eviction. Azure will automatically restart the VM when capacity becomes available at the spot price."
      },
      {
        id: "C",
        text: "Hibernate",
        rationale: "Incorrect. Hibernate is not an eviction policy option for Spot VMs."
      },
      {
        id: "D",
        text: "Preempt",
        rationale: "Incorrect. 'Preempt' is not a valid eviction policy name in Azure Spot VM configuration."
      },
    ],
    correctOptionId: "B",
    explanation: "Spot VM eviction policies are 'Deallocate' and 'Delete'. Deallocate stops and preserves the VM, and Azure automatically restarts it when Spot capacity is available again. Delete removes the VM and disks permanently, requiring manual re-deployment. The Deallocate policy is the correct choice when automatic recovery is needed."
  }),

  choiceQuestion({
    id: "Q2323",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso",
    scenario: "Your organization has registered an on-premises Linux server with Azure Arc. You need to confirm the server appears correctly in the Azure portal for ongoing management.",
    stem: "Under which section of the Azure portal would you find the registered on-premises server?",
    subtopic: "Manage Azure Arc-enabled servers",
    referenceTopic: "Azure Arc  portal navigation for Arc-enabled servers",

    hint: "Arc-enabled (hybrid/multi-cloud) servers are managed via the Azure Arc blade. The Azure VMs blade shows only cloud-native Azure VMs, not Arc-registered machines.",
    options: [
      {
        id: "A",
        text: "Azure Virtual Machines",
        rationale: "Incorrect. Azure Virtual Machines shows only VMs hosted in Azure. Arc-enabled servers are on-premises or other-cloud machines, listed separately."
      },
      {
        id: "B",
        text: "Azure Arc > Machines",
        rationale: "Correct. Arc-enabled servers (on-premises or multi-cloud) appear under Azure Arc > Machines in the Azure portal."
      },
      {
        id: "C",
        text: "Azure Monitor > Insights > Machines",
        rationale: "Incorrect. This area shows monitoring insights for machines but is not the primary management view for Arc-enabled servers."
      },
      {
        id: "D",
        text: "Microsoft Defender for Cloud > Inventory",
        rationale: "Incorrect. Defender for Cloud Inventory lists all resources for security assessment, but it is not the management surface for Arc-enabled servers."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Arc-enabled servers are registered as resources in Azure and appear under the Azure Arc > Machines blade. From there you can manage extensions, policies, tags, and monitoring configuration for the registered machines."
  }),

  choiceQuestion({
    id: "Q2324",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Litware",
    scenario: "A developer wants to create deployment slots for an Azure App Service web application to support a staging environment before production deployments.",
    stem: "What is the minimum App Service plan tier that supports deployment slots?",
    subtopic: "Configure Azure App Service",
    referenceTopic: "App Service  deployment slots tier requirement",

    hint: "Deployment slots are a Standard tier feature (S1+). Free, Shared, and Basic tiers do not support slots. Standard allows up to 5 slots; Premium allows up to 20.",
    options: [
      {
        id: "A",
        text: "Free (F1)",
        rationale: "Incorrect. The Free tier does not support deployment slots."
      },
      {
        id: "B",
        text: "Shared (D1)",
        rationale: "Incorrect. The Shared tier does not support deployment slots."
      },
      {
        id: "C",
        text: "Basic (B1)",
        rationale: "Incorrect. The Basic tier does not support deployment slots."
      },
      {
        id: "D",
        text: "Standard (S1)",
        rationale: "Correct. Deployment slots are available starting at the Standard (S1) tier. Standard supports up to 5 slots; Premium supports up to 20."
      },
    ],
    correctOptionId: "D",
    explanation: "Azure App Service deployment slots require the Standard pricing tier (S1 or higher). The Free, Shared, and Basic tiers do not include this feature. Standard supports up to 5 slots and allows slot swap operations for zero-downtime deployments."
  }),

  multiSelectQuestion({
    id: "Q2325",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Fabrikam",
    scenario: "A development team is evaluating Azure Container Apps for a microservices workload. They need the platform to automatically scale down to zero replicas when there is no incoming traffic, and they do not want to manage Kubernetes infrastructure directly.",
    stem: "Which TWO features of Azure Container Apps satisfy these requirements?",
    subtopic: "Configure and manage containerized workloads",
    referenceTopic: "Azure Container Apps  KEDA-based scaling and managed infrastructure",

    hint: "Container Apps uses KEDA for event-driven autoscaling (including scale-to-zero) and fully abstracts Kubernetes infrastructure from developers. No direct K8s manifest writing required.",
    options: [
      {
        id: "A",
        text: "Azure Container Apps uses KEDA-based scaling rules that support scale-to-zero, including HTTP-based scaling.",
        rationale: "Correct. Container Apps integrates KEDA (Kubernetes-based Event Driven Autoscaling), which supports scaling to zero replicas when there is no traffic."
      },
      {
        id: "B",
        text: "Azure Container Apps is a fully managed platform where Microsoft manages the underlying Kubernetes infrastructure.",
        rationale: "Correct. Container Apps abstracts the Kubernetes cluster; developers interact only with the Container Apps environment and application concepts, not with Kubernetes nodes or control planes."
      },
      {
        id: "C",
        text: "Azure Container Apps integrates natively with Azure Kubernetes Service node pools for custom scaling policies.",
        rationale: "Incorrect. Container Apps does not require or integrate with AKS node pools; it is an independent managed platform."
      },
      {
        id: "D",
        text: "Azure Container Apps requires you to define Kubernetes Horizontal Pod Autoscaler (HPA) YAML configurations for scale-to-zero.",
        rationale: "Incorrect. Container Apps abstracts HPA; scaling is configured through Container Apps scaling rules without writing Kubernetes YAML."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "Azure Container Apps is a fully managed serverless container platform. It uses KEDA internally to provide event-driven autoscaling including scale-to-zero, and it fully abstracts the Kubernetes control plane and node management from the developer."
  }),

  choiceQuestion({
    id: "Q2326",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Proseware",
    scenario: "A global application is deployed in three Azure regions: West US, East US, and West Europe. The application uses a private Docker container image. Development teams in each region need to pull the container image with low latency without relying on a single registry endpoint.",
    stem: "Which Azure Container Registry feature should you enable to achieve this?",
    subtopic: "Configure container registry",
    referenceTopic: "Azure Container Registry  geo-replication",

    hint: "ACR geo-replication creates read-only regional replicas for low-latency image pulls. Teams in each region pull from the nearest replica without cross-region traffic.",
    options: [
      {
        id: "A",
        text: "Enable content trust on the container registry for image signing.",
        rationale: "Incorrect. Content trust provides image signature verification for supply-chain security, not geographic distribution."
      },
      {
        id: "B",
        text: "Enable geo-replication on the container registry to replicate the registry to all three regions.",
        rationale: "Correct. ACR geo-replication replicates the registry to multiple Azure regions. Each region has a local replica, enabling low-latency pulls without cross-region traffic."
      },
      {
        id: "C",
        text: "Create a separate container registry in each region and push the image to all three registries.",
        rationale: "Incorrect. Managing separate registries creates operational overhead and synchronization complexity; geo-replication is the built-in feature for this purpose."
      },
      {
        id: "D",
        text: "Use an Azure CDN endpoint in front of the container registry for regional caching.",
        rationale: "Incorrect. Azure CDN is not compatible with OCI container registry protocols. ACR geo-replication is the correct mechanism."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Container Registry geo-replication creates read replicas of a registry in selected regions. Teams in those regions pull images from the nearest replica, reducing latency and cross-region egress costs. A single registry URL is used regardless of which replica serves the request."
  }),

  yesNoQuestion({
    id: "Q2327",
    domain: "D3",
    type: "yes-no",
    difficulty: "hard",
    company: "Woodgrove",
    scenario: "You are comparing the Azure Custom Script Extension and Azure Desired State Configuration (DSC) extension for VM configuration management. Evaluate the following statements.",
    stem: "For each statement, select Yes if the statement is true. Otherwise, select No.",
    subtopic: "Configure virtual machine extensions",
    referenceTopic: "Custom Script Extension vs DSC extension  behavior and capabilities",

    hint: "Custom Script Extension runs once at deployment; DSC supports pull servers (like Azure Automation) for recurring updates. Both may require reboots depending on the configuration.",
    statements: [
      {
        id: "S1",
        text: "The Custom Script Extension runs a script exactly once when first deployed to a VM and does not re-run automatically on subsequent VM reboots.",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "The Azure DSC extension can be configured to use a pull server model where the VM periodically checks a central server for updated configuration.",
        answer: "Yes"
      },
      {
        id: "S3",
        text: "Both the Custom Script Extension and the DSC extension can apply configuration changes to a running VM without requiring a reboot.",
        answer: "No"
      },
    ],
    explanation: "Custom Script Extension runs once at deployment and does not re-run on reboots  True. DSC supports a pull server (Azure Automation State Configuration is an example of a pull service) where nodes check in periodically for configuration changes  True. Both extensions can require a reboot depending on the configuration applied (e.g., installing Windows roles often requires a reboot); the statement that neither ever requires a reboot is False."
  }),

  choiceQuestion({
    id: "Q2328",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso",
    scenario: "A high-performance computing (HPC) application requires multiple Azure VMs to communicate with each other with the lowest possible network latency. The VMs are in the same Azure region. The team is willing to accept a potential impact to availability in exchange for the lowest possible latency between VMs.",
    stem: "Which Azure feature should you use to achieve the lowest network latency between these VMs?",
    subtopic: "Configure Azure Virtual Machine availability",
    referenceTopic: "Proximity Placement Groups  co-location for low latency",

    hint: "Proximity Placement Groups co-locate VMs in the same physical data center rack or cluster. Trade-off: reduced fault isolation but minimal network latency between VMs.",
    options: [
      {
        id: "A",
        text: "Availability Set",
        rationale: "Incorrect. Availability Sets distribute VMs across fault and update domains to maximize availability, but they can actually place VMs farther apart within a data center."
      },
      {
        id: "B",
        text: "Availability Zone",
        rationale: "Incorrect. Availability Zones place VMs in physically separate buildings within a region, increasing latency between VMs due to physical distance."
      },
      {
        id: "C",
        text: "Proximity Placement Group",
        rationale: "Correct. Proximity Placement Groups co-locate VMs within the same physical data center rack or cluster, minimizing network latency. The trade-off is reduced fault isolation."
      },
      {
        id: "D",
        text: "Accelerated Networking",
        rationale: "Partially correct  Accelerated Networking (SR-IOV) reduces network latency by bypassing the hypervisor for each individual VM. However, the question asks about co-location of multiple VMs, which is Proximity Placement Groups."
      },
    ],
    correctOptionId: "C",
    explanation: "Proximity Placement Groups (PPG) instruct Azure to deploy VMs in the same logical hardware cluster, minimizing the network hops and physical distance between them. This achieves the lowest possible inter-VM latency. The trade-off is reduced fault isolation, as co-located VMs may share hardware failure domains."
  }),

  choiceQuestion({
    id: "Q2329",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum",
    scenario: "A Bicep template is being written to deploy an Azure Virtual Network and a subnet as a nested child resource. The template author wants to define the subnet inside the virtual network resource block using the idiomatic Bicep syntax for child resources, rather than using the full resource type string.",
    stem: "Which Bicep property should be used to declare a subnet as a child resource of the virtual network in the Bicep template?",
    subtopic: "Deploy resources by using Azure Bicep templates",
    referenceTopic: "Bicep child resources  parent property and nested declaration",

    hint: "Bicep uses the 'parent' property on child resources to establish parent-child relationships. Bicep automatically constructs the correct API resource path at compilation.",
    options: [
      {
        id: "A",
        text: "Declare the subnet as a separate resource with type 'Microsoft.Network/virtualNetworks/subnets' and set the 'parent' property to the symbolic name of the virtual network.",
        rationale: "Correct. In Bicep, the 'parent' property establishes the parent-child relationship between a child resource and its parent without embedding the full resource type path in the child. This is idiomatic and preferred over embedding the full resource type."
      },
      {
        id: "B",
        text: "Embed the subnet resource block directly inside the virtual network's 'properties' section using the 'subnets' array.",
        rationale: "Partially correct  embedding subnets in the 'subnets' array within 'properties' is supported in Bicep and ARM templates, but the question asks about the idiomatic child resource declaration using Bicep's resource nesting syntax, which uses the 'parent' property."
      },
      {
        id: "C",
        text: "Use the 'dependsOn' property with the virtual network's symbolic name in the subnet resource declaration.",
        rationale: "Incorrect. 'dependsOn' controls deployment ordering but does not establish a parent-child relationship in Bicep. The child resource would still need the full type path."
      },
      {
        id: "D",
        text: "Use a Bicep module to separate the subnet into its own file and pass the VNet name as a parameter.",
        rationale: "Incorrect. Modules are a code organization feature, not the mechanism for declaring child resources within the same template."
      },
    ],
    correctOptionId: "A",
    explanation: "Bicep's idiomatic syntax for child resources uses the 'parent' property on the child resource declaration. The child resource type uses only the short type segment (e.g., 'Microsoft.Network/virtualNetworks/subnets') and the 'parent' property references the parent's symbolic name. Bicep automatically constructs the correct API resource path at compilation."
  }),

  choiceQuestion({
    id: "Q2330",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Fabrikam",
    scenario: "An orchestration workflow implemented in Azure Durable Functions needs to execute 20 parallel activities that each call an external API. The orchestrator should wait until all 20 activities complete before proceeding to the next step. Activity results must be aggregated before the workflow continues.",
    stem: "Which Durable Functions application pattern is most appropriate for this workflow?",
    subtopic: "Configure Azure Functions",
    referenceTopic: "Durable Functions patterns  fan-out/fan-in",

    hint: "Fan-out/fan-in uses Task.WhenAll to spawn multiple parallel activities, wait for all to complete, then aggregate results before the workflow continues to the next step.",
    options: [
      {
        id: "A",
        text: "Async HTTP API pattern",
        rationale: "Incorrect. The Async HTTP API pattern is used to expose a long-running operation via an HTTP endpoint; it is not the pattern for parallel task execution."
      },
      {
        id: "B",
        text: "Monitor pattern",
        rationale: "Incorrect. The Monitor pattern implements a recurring polling loop. It is not designed for spawning parallel tasks."
      },
      {
        id: "C",
        text: "Fan-out/fan-in pattern",
        rationale: "Correct. The fan-out/fan-in pattern uses Task.WhenAll (or equivalent) in the orchestrator to launch multiple parallel activity invocations and then waits for all of them to complete before continuing  exactly matching the described scenario."
      },
      {
        id: "D",
        text: "Chaining pattern",
        rationale: "Incorrect. The Chaining pattern executes activities sequentially, one after another. It does not support parallel execution."
      },
    ],
    correctOptionId: "C",
    explanation: "The Durable Functions fan-out/fan-in pattern uses an orchestrator to start multiple activity functions in parallel (fan-out) and then uses Task.WhenAll to wait for all parallel tasks to complete before aggregating results (fan-in). This is precisely the pattern described: 20 parallel API calls followed by aggregation before continuing the workflow."
  }),

  choiceQuestion({
    id: "Q2331",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso",
    scenario: "Your organization needs to apply operating system patches to a fleet of 200 Azure VMs during a scheduled maintenance window: the second Tuesday of every month between 8 PM and 10 PM UTC. The patching must not proceed automatically outside this window, and any patching outside the window must be prevented. You are using Azure Update Manager.",
    stem: "Which Azure Update Manager feature should you configure?",
    subtopic: "Manage virtual machine updates by using Azure Update Manager",
    referenceTopic: "Azure Update Manager  maintenance configurations for scheduled patching",

    hint: "Maintenance configurations define recurring schedules (day of week, time range, timezone). VMs associated with a maintenance config patch only during the defined window.",
    options: [
      {
        id: "A",
        text: "Enable automatic guest patching on all VMs to apply patches immediately as they become available.",
        rationale: "Incorrect. Automatic guest patching applies patches on Azure's schedule, not a customer-controlled window, which violates the maintenance window requirement."
      },
      {
        id: "B",
        text: "Create a maintenance configuration with a recurring schedule on the second Tuesday of each month, and associate the VMs with that maintenance configuration.",
        rationale: "Correct. Maintenance configurations in Azure Update Manager allow you to define a recurring schedule and associate VMs with it. Patches are only applied during the defined window."
      },
      {
        id: "C",
        text: "Use Azure Automation Update Management to deploy update schedules.",
        rationale: "Incorrect. Azure Automation Update Management is a legacy solution; Azure Update Manager is the current platform. The question specifically mentions Azure Update Manager."
      },
      {
        id: "D",
        text: "Configure VM scale set rolling upgrade policy with maxSurge to control patch rollout timing.",
        rationale: "Incorrect. Rolling upgrade policy is for VMSS OS image upgrades, not for OS-level security patches managed by Update Manager."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Update Manager maintenance configurations define specific recurring schedules (including day of week, time range, and timezone) for patch deployment. By associating the 200 VMs with a maintenance configuration set to the second Tuesday 8-10 PM UTC, Azure ensures patches are deployed only during that window. No patches are applied outside the configured window, satisfying the compliance requirement."
  }),

  choiceQuestion({
    id: "Q2332",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Northwind",
    scenario: "A batch job is containerized and deployed as an Azure Container Instance (ACI). The job is expected to run for approximately 2 hours and exit when complete. The team wants the container to stop and not attempt to restart after it exits successfully.",
    stem: "Which restart policy should you configure on the Azure Container Instance?",
    subtopic: "Configure Azure Container Instances",
    referenceTopic: "ACI restart policies  Always, OnFailure, Never",

    hint: "ACI restart policies are Always, OnFailure, or Never. For one-time batch jobs that should not restart on completion, choose Never.",
    options: [
      {
        id: "A",
        text: "Always",
        rationale: "Incorrect. The Always policy restarts the container every time it exits, including successful exits, which is not desired for a one-time batch job."
      },
      {
        id: "B",
        text: "OnFailure",
        rationale: "Incorrect. OnFailure restarts the container only when it exits with a non-zero exit code. The team wants no restart at all, not even on failure."
      },
      {
        id: "C",
        text: "Never",
        rationale: "Correct. The Never restart policy means the container is not restarted under any circumstances  whether it exits successfully or with an error. This is appropriate for one-time batch jobs."
      },
      {
        id: "D",
        text: "OnSuccess",
        rationale: "Incorrect. 'OnSuccess' is not a valid ACI restart policy. The valid options are Always, OnFailure, and Never."
      },
    ],
    correctOptionId: "C",
    explanation: "Azure Container Instances supports three restart policies: Always (always restart), OnFailure (restart only on error), and Never (never restart). For a batch job that should run once and terminate, the Never policy is correct."
  }),

  //  D4: Networking 

  choiceQuestion({
    id: "Q2333",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Adatum",
    scenario: "You have linked a private DNS zone (internal.adatum.com) to a virtual network. Virtual machines deployed in that VNet are not having their DNS records automatically registered in the private zone. The VNet link exists but auto-registration was not explicitly configured.",
    stem: "What must you change to enable auto-registration of VM DNS records?",
    subtopic: "Configure Azure private DNS zones",
    referenceTopic: "Private DNS zones  VNet link auto-registration flag",

    hint: "VNet links to private DNS zones have an Auto-registration toggle. Enable it to auto-create DNS A records for VMs in the linked VNet on allocation/deallocation.",
    options: [
      {
        id: "A",
        text: "Delete the existing VNet link and recreate it.",
        rationale: "Incorrect. Recreating the link without enabling auto-registration will produce the same result."
      },
      {
        id: "B",
        text: "Edit the VNet link to enable the 'Auto-registration' checkbox.",
        rationale: "Correct. The VNet link has an 'Auto-registration' toggle. When enabled, Azure automatically creates DNS A records in the private zone for VMs in the linked VNet when they are allocated or deallocated."
      },
      {
        id: "C",
        text: "Assign the Private DNS Zone Contributor RBAC role to the VM's managed identity.",
        rationale: "Incorrect. Auto-registration is performed by the Azure platform, not by the VM itself. RBAC assignments are not involved."
      },
      {
        id: "D",
        text: "Add a DNS server entry for the private zone IP in the VNet's custom DNS server settings.",
        rationale: "Incorrect. Private DNS zone resolution works through Azure's built-in DNS (168.63.129.16); custom DNS server settings are for directing queries to on-premises or custom resolvers, not for enabling auto-registration."
      },
    ],
    correctOptionId: "B",
    explanation: "Auto-registration on a private DNS zone VNet link is controlled by a dedicated flag on the link object. When enabled, the Azure platform automatically creates and deletes DNS records in the private zone as VMs in the linked VNet are allocated or deallocated. It must be explicitly enabled; it is not on by default."
  }),

  choiceQuestion({
    id: "Q2334",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Litware",
    scenario: "Administrators need to connect to virtual machines in an Azure virtual network using the native SSH and RDP clients on their local machines (not the Azure portal-based browser client) without exposing the VMs to the public internet.",
    stem: "Which Azure Bastion SKU supports native client connectivity?",
    subtopic: "Configure Azure Bastion",
    referenceTopic: "Azure Bastion SKUs  Basic vs Standard native client support",

    hint: "Azure Bastion Basic SKU is portal-browser-only access. Standard and Developer SKUs support native client connectivity for SSH and RDP via local clients.",
    options: [
      {
        id: "A",
        text: "Basic SKU",
        rationale: "Incorrect. The Basic SKU supports only browser-based connections through the Azure portal. Native client connectivity requires the Standard SKU."
      },
      {
        id: "B",
        text: "Standard SKU",
        rationale: "Correct. The Standard SKU (and Developer SKU for single-VM use) supports native client connectivity, allowing users to connect using their local SSH or RDP client."
      },
      {
        id: "C",
        text: "Free SKU",
        rationale: "Incorrect. There is no 'Free SKU' for Azure Bastion."
      },
      {
        id: "D",
        text: "Any SKU supports native client connectivity by default.",
        rationale: "Incorrect. Native client connectivity is a feature exclusive to the Standard and Developer SKUs."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Bastion Standard SKU adds native client connectivity, allowing users to connect to VMs using their local SSH or RDP clients by tunneling the connection through Bastion. The Basic SKU supports only browser-based connections via the Azure portal."
  }),

  multiSelectQuestion({
    id: "Q2335",
    domain: "D4",
    type: "multi-select",
    difficulty: "hard",
    company: "Fabrikam",
    scenario: "You are explaining the difference between Azure Private Endpoints and Service Endpoints to a team that is designing a secure architecture for accessing Azure PaaS services from a virtual network. A colleague made two statements about private endpoints.",
    stem: "Which TWO statements about Azure Private Endpoints are correct?",
    subtopic: "Configure private endpoints",
    referenceTopic: "Private endpoints vs service endpoints  traffic path and network interface",

    hint: "Private endpoints create a real NIC with a private IP in the VNet; PE traffic uses the Microsoft backbone. Service endpoints use the public endpoint IP but route over backbone.",
    options: [
      {
        id: "A",
        text: "A private endpoint creates a network interface with a private IP address from the VNet's address space and assigns it to the PaaS service.",
        rationale: "Correct. A private endpoint provisions a NIC in the VNet with a private IP address, making the PaaS service reachable via that private IP."
      },
      {
        id: "B",
        text: "Traffic from the VNet to a PaaS service over a private endpoint does not traverse the public internet; it remains on the Microsoft backbone.",
        rationale: "Correct. Private endpoint traffic stays entirely within the Microsoft backbone network. DNS resolves the service FQDN to the private IP, so traffic never reaches the public endpoint."
      },
      {
        id: "C",
        text: "A service endpoint also assigns a private IP address to the PaaS service within the VNet.",
        rationale: "Incorrect. Service endpoints do NOT assign a private IP to the service. Traffic uses the service's public endpoint IP but is routed over the Azure backbone from the VNet, not over the internet."
      },
      {
        id: "D",
        text: "Enabling a private endpoint for a storage account automatically disables all public access to the storage account.",
        rationale: "Incorrect. Creating a private endpoint does not automatically change the storage account's public network access setting. Public access must be explicitly restricted via the firewall settings."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "A private endpoint creates a real NIC with a private IP in the VNet, and DNS is configured to resolve the service FQDN to that private IP. All traffic flows via the Microsoft backbone. Service endpoints, by contrast, do not assign private IPs; they optimize routing over the backbone but still use the service's public IP."
  }),

  choiceQuestion({
    id: "Q2336",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Woodgrove Bank",
    scenario: "Woodgrove Bank has an existing ExpressRoute circuit connecting on-premises to Azure. Large volumes of traffic are flowing between on-premises and Azure VMs. The networking team has profiled the traffic and wants to eliminate the performance overhead caused by the ExpressRoute gateway processing data-plane traffic. The existing circuit is a 10 Gbps ExpressRoute circuit.",
    stem: "Which feature should you enable, and what is the gateway SKU requirement for this feature?",
    subtopic: "Configure Azure ExpressRoute",
    referenceTopic: "ExpressRoute FastPath  gateway bypass and SKU requirements",

    hint: "ExpressRoute FastPath bypasses the gateway data plane, routing packets directly between on-premises and VNet VMs. Requires UltraPerformance or ErGw3AZ gateway SKU.",
    options: [
      {
        id: "A",
        text: "Enable ExpressRoute Global Reach; it requires the UltraPerformance gateway SKU.",
        rationale: "Incorrect. Global Reach enables direct on-premises-to-on-premises connectivity via ExpressRoute circuits; it does not bypass the gateway data plane."
      },
      {
        id: "B",
        text: "Enable ExpressRoute FastPath; it requires the UltraPerformance or ErGw3AZ gateway SKU.",
        rationale: "Correct. ExpressRoute FastPath bypasses the ExpressRoute gateway for data-plane traffic, allowing packets to flow directly between on-premises and Azure VMs without gateway processing. It requires either the UltraPerformance or ErGw3AZ SKU."
      },
      {
        id: "C",
        text: "Enable ExpressRoute FastPath; it works with any ExpressRoute gateway SKU.",
        rationale: "Incorrect. FastPath is only supported on the UltraPerformance and ErGw3AZ gateway SKUs."
      },
      {
        id: "D",
        text: "Enable ExpressRoute Direct; it bypasses the gateway and requires a dedicated 10 Gbps or 100 Gbps port.",
        rationale: "Incorrect. ExpressRoute Direct provides dedicated physical connectivity to Microsoft's network but does not specifically bypass the VNet gateway's data plane overhead."
      },
    ],
    correctOptionId: "B",
    explanation: "ExpressRoute FastPath is a feature that bypasses the ExpressRoute gateway's data plane, routing packets directly between on-premises and VNet VMs via the Microsoft backbone. This eliminates the gateway bottleneck for high-throughput workloads. It requires the UltraPerformance or ErGw3AZ gateway SKU and does not affect control plane operations."
  }),

  choiceQuestion({
    id: "Q2337",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Proseware",
    scenario: "A Web Application Firewall (WAF) policy is attached to an Azure Application Gateway. After enabling the WAF in Prevention mode, several legitimate web requests from the company's own automated testing tool are being blocked with 403 errors. The security team needs to diagnose which rules are blocking the requests without immediately re-enabling all traffic.",
    stem: "Which WAF mode should you temporarily switch to, in order to log rule matches without blocking traffic?",
    subtopic: "Configure Azure Application Gateway and WAF",
    referenceTopic: "WAF modes  Detection vs Prevention",

    hint: "WAF Detection mode logs all rule matches to diagnostics without blocking traffic. Use it to identify which rules trigger on legitimate requests before creating exclusions.",
    options: [
      {
        id: "A",
        text: "Prevention mode",
        rationale: "Incorrect. Prevention mode is already enabled and is actively blocking the legitimate requests."
      },
      {
        id: "B",
        text: "Detection mode",
        rationale: "Correct. Detection mode logs all rule matches to the WAF diagnostic logs but does not block any traffic. Switching to Detection mode allows the team to identify which rules are triggering on legitimate requests before creating exclusions."
      },
      {
        id: "C",
        text: "Audit mode",
        rationale: "Incorrect. 'Audit mode' is not a valid WAF mode for Azure Application Gateway WAF. The two modes are Detection and Prevention."
      },
      {
        id: "D",
        text: "Disable the WAF policy entirely while diagnosing.",
        rationale: "Incorrect. Disabling the WAF removes all protection during the diagnostic window, which is a greater security risk than switching to Detection mode."
      },
    ],
    correctOptionId: "B",
    explanation: "WAF Detection mode logs all rule matches without blocking traffic. This allows administrators to review the WAFLogs in Azure Monitor or Log Analytics to identify which rule IDs are matching legitimate requests, and then create appropriate rule exclusions before switching back to Prevention mode."
  }),

  yesNoQuestion({
    id: "Q2338",
    domain: "D4",
    type: "yes-no",
    difficulty: "medium",
    company: "Contoso",
    scenario: "You are reviewing Azure NAT Gateway capabilities for outbound internet connectivity from a virtual network subnet. Evaluate the following statements.",
    stem: "For each statement, select Yes if the statement is true. Otherwise, select No.",
    subtopic: "Configure Azure NAT Gateway",
    referenceTopic: "Azure NAT Gateway  SNAT, inbound, and multiple IP support",

    hint: "NAT Gateway provides outbound SNAT for internet connections. It is outbound-only (no inbound). Multiple public IPs or prefixes increase available SNAT port capacity.",
    statements: [
      {
        id: "S1",
        text: "Azure NAT Gateway provides SNAT (Source Network Address Translation) for outbound internet connections from subnet resources.",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "Azure NAT Gateway can be used to accept inbound connections initiated from the internet.",
        answer: "No"
      },
      {
        id: "S3",
        text: "Multiple public IP addresses or a public IP prefix can be associated with a single NAT Gateway to increase available SNAT ports.",
        answer: "Yes"
      },
    ],
    explanation: "NAT Gateway provides outbound SNAT  True. NAT Gateway is outbound-only and does not accept inbound-initiated connections  False. Multiple public IPs or a prefix can be associated with NAT Gateway, with each IP contributing 64,512 SNAT ports  True."
  }),

  choiceQuestion({
    id: "Q2339",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum",
    scenario: "Adatum has a hub-and-spoke network topology using Azure Virtual WAN. The organization has Virtual WAN hubs in East US and West Europe. Spoke VNets are connected to their respective regional hubs. A business requirement states that East US spoke VMs must be able to communicate with West Europe spoke VMs, and all traffic between regions must traverse Microsoft's backbone network rather than the public internet.",
    stem: "How does Azure Virtual WAN enable this inter-region spoke-to-spoke communication?",
    subtopic: "Configure Azure Virtual WAN",
    referenceTopic: "Virtual WAN  hub-to-hub routing over Microsoft backbone",

    hint: "Azure Virtual WAN standard hubs automatically establish hub-to-hub connectivity over the Microsoft backbone. Once spokes connect to regional hubs, inter-region traffic routes automatically.",
    options: [
      {
        id: "A",
        text: "You must manually create VNet peering between the East US and West Europe spoke VNets.",
        rationale: "Incorrect. Creating spoke-to-spoke peering would bypass Virtual WAN hub routing and creates direct peering connections that may conflict with the hub-spoke topology."
      },
      {
        id: "B",
        text: "Virtual WAN automatically routes traffic between connected hubs over the Microsoft backbone; no additional configuration is required once both hubs are connected.",
        rationale: "Correct. Azure Virtual WAN provides any-to-any connectivity, including hub-to-hub, over Microsoft's global backbone. Once spoke VNets are connected to their respective regional hubs, Virtual WAN routing automatically enables inter-region connectivity."
      },
      {
        id: "C",
        text: "You must deploy a Network Virtual Appliance (NVA) in each hub to route traffic between regions.",
        rationale: "Incorrect. An NVA can be deployed for additional inspection, but it is not required for basic inter-region connectivity in Virtual WAN. Hub-to-hub routing is built into the platform."
      },
      {
        id: "D",
        text: "Configure VPN site-to-site connections between the East US and West Europe hubs to create the inter-region path.",
        rationale: "Incorrect. Virtual WAN hub-to-hub routing does not use VPN tunnels; it uses Microsoft's backbone infrastructure with platform-managed routing."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Virtual WAN standard hubs automatically establish hub-to-hub connectivity over Microsoft's global WAN backbone. When spoke VNets are connected to their regional hubs, traffic between spokes in different regions is automatically routed via the respective hubs without manual configuration of peering or VPN tunnels."
  }),

  choiceQuestion({
    id: "Q2340",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Litware",
    scenario: "A virtual machine in Azure cannot establish an outbound TCP connection to an external IP address on port 443. A network administrator needs to diagnose whether the issue is an NSG rule blocking the traffic or a network routing/connectivity issue.",
    stem: "Which Network Watcher tool should you use first to determine if an NSG rule is blocking the specific outbound traffic?",
    subtopic: "Troubleshoot virtual networking using Azure Network Watcher",
    referenceTopic: "Network Watcher  IP flow verify vs Connection Troubleshoot",

    hint: "IP flow verify evaluates NSG rules for a specific traffic flow and returns whether allowed/denied plus the matching rule. It is faster than full connection troubleshoot.",
    options: [
      {
        id: "A",
        text: "IP flow verify",
        rationale: "Correct. IP flow verify checks whether a specific flow (defined by source IP, destination IP, port, and protocol) is allowed or denied by NSG rules. It directly answers whether an NSG rule is responsible for blocking the traffic."
      },
      {
        id: "B",
        text: "Connection Troubleshoot",
        rationale: "Incorrect. Connection Troubleshoot tests end-to-end connectivity and can identify NSG blocks, but it also performs a full TCP connection test and takes longer to complete. IP flow verify is faster for specifically diagnosing NSG rule matches."
      },
      {
        id: "C",
        text: "Network Performance Monitor",
        rationale: "Incorrect. Network Performance Monitor tracks ongoing latency and packet loss metrics; it is not used for real-time NSG rule diagnosis."
      },
      {
        id: "D",
        text: "Traffic Analytics",
        rationale: "Incorrect. Traffic Analytics provides aggregated flow log insights over time; it does not provide real-time, per-flow NSG rule evaluation."
      },
    ],
    correctOptionId: "A",
    explanation: "IP flow verify in Azure Network Watcher evaluates NSG rules for a specific traffic flow and returns whether the flow is allowed or denied, and which rule is responsible. It is the fastest targeted tool for confirming whether an NSG is blocking a specific outbound connection."
  }),

  choiceQuestion({
    id: "Q2341",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Proseware",
    scenario: "An Azure Application Gateway backend pool includes three web server VMs. A VM needs to be gracefully removed from the backend pool for maintenance. The team wants to ensure that in-flight requests already being processed by that VM are allowed to complete before it is removed from rotation, with a maximum wait time of 30 seconds.",
    stem: "Which Application Gateway feature should you configure?",
    subtopic: "Configure Azure Application Gateway",
    referenceTopic: "Application Gateway  connection draining",

    hint: "Connection draining stops sending new requests to unhealthy or being-removed backends but allows existing in-flight connections to complete within the configured timeout.",
    options: [
      {
        id: "A",
        text: "Configure a custom health probe with a 30-second timeout.",
        rationale: "Incorrect. Health probes detect whether a backend is healthy. They do not control how in-flight requests are handled during a planned removal."
      },
      {
        id: "B",
        text: "Enable connection draining on the backend HTTP settings with a drain timeout of 30 seconds.",
        rationale: "Correct. Connection draining allows the Application Gateway to let existing connections complete on a backend being marked as unhealthy or being removed from the pool, up to the configured timeout."
      },
      {
        id: "C",
        text: "Reduce the request timeout on the backend HTTP settings to 30 seconds.",
        rationale: "Incorrect. Reducing the request timeout would cause requests that take longer than 30 seconds to be aborted, not gracefully completed."
      },
      {
        id: "D",
        text: "Configure a rewrite rule to redirect traffic away from the VM's IP before removing it.",
        rationale: "Incorrect. Rewrite rules modify HTTP headers and URLs; they are not a mechanism for graceful backend removal."
      },
    ],
    correctOptionId: "B",
    explanation: "Connection draining is an Application Gateway backend HTTP settings feature that enables graceful backend removal. When enabled, the gateway stops sending new requests to a backend being deregistered but allows existing in-flight connections to complete up to the configured drain timeout. This prevents request interruption during planned maintenance."
  }),

  dragDropQuestion({
    id: "Q2342",
    domain: "D4",
    type: "drag-drop",
    difficulty: "hard",
    company: "Woodgrove",
    scenario: "You are configuring a Point-to-Site (P2S) VPN connection for remote users using certificate-based authentication to connect to an Azure virtual network.",
    stem: "Arrange the steps in the correct order to configure certificate-based P2S VPN connectivity.",
    subtopic: "Configure Azure VPN Gateways",
    referenceTopic: "Point-to-Site VPN  certificate authentication workflow",

    hint: "P2S VPN workflow: VPN Gateway must exist first, then generate root CA + client certs, upload root CA public data to gateway, distribute client certs to remote users.",
    availableItems: [
    "Upload the root CA certificate public data to the VPN Gateway",
    "Generate root CA and client certificates using PowerShell or a certificate tool",
    "Distribute the client certificate to remote user devices",
    "Create a GatewaySubnet in the target virtual network and deploy a VPN Gateway into it"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Create a GatewaySubnet in the target virtual network and deploy a VPN Gateway into it",
      "Generate root CA and client certificates using PowerShell or a certificate tool",
      "Upload the root CA certificate public data to the VPN Gateway",
      "Distribute the client certificate to remote user devices",
    ],
    explanation: "The VPN Gateway must exist before certificates can be uploaded to it. Certificates are generated first on-premises, then the root CA public data is uploaded to the gateway for authentication, and finally client certificates are distributed to remote users for their VPN clients."
  }),

  //  D5: Monitoring & Cost 

  choiceQuestion({
    id: "Q2343",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum",
    scenario: "A Log Analytics workspace receives Azure Monitor metrics for all virtual machines in a subscription. A compliance analyst needs a KQL query that shows the top 5 virtual machines by total CPU usage (in CPU-seconds) over the last 24 hours, displayed as a table with ResourceId and total CPU usage.",
    stem: "Which KQL query structure correctly implements this requirement?",
    subtopic: "Query and analyze logs in Azure Monitor",
    referenceTopic: "KQL  time filters, summarize, and top operator for resource metrics",

    hint: "KQL query pattern: apply time filter BEFORE aggregating. Use 'summarize sum(CounterValue) by _ResourceId' to aggregate, then 'top 5 by' to rank results.",
    options: [
      {
        id: "A",
        text: "Perf | where TimeGenerated > ago(24h) and CounterName == 'Processor Time' | summarize TotalCPU = sum(CounterValue) by _ResourceId | top 5 by TotalCPU desc",
        rationale: "Correct. This query filters to the last 24 hours and to the CPU counter, aggregates the total counter value per resource, and returns the top 5 by descending total."
      },
      {
        id: "B",
        text: "Perf | summarize TotalCPU = avg(CounterValue) by _ResourceId | top 5 by TotalCPU | where TimeGenerated > ago(24h)",
        rationale: "Incorrect. The where clause must be applied before aggregation; placing it after 'top' causes a syntax error and incorrect results even if it parsed."
      },
      {
        id: "C",
        text: "AzureMetrics | where MetricName == 'Percentage CPU' | summarize Total = sum(Total) by ResourceId | order by Total desc | take 5",
        rationale: "Partially correct in structure but uses the AzureMetrics table which is for Azure resource platform metrics, not the Perf table used for VM guest OS metrics. The 'take' operator and 'order by' combination is functionally equivalent to 'top', but the table choice is wrong for guest OS CPU counters."
      },
      {
        id: "D",
        text: "Perf | where TimeGenerated > ago(24h) | where CounterName == 'Processor Time' | count by _ResourceId | top 5",
        rationale: "Incorrect. The 'count by' syntax is not valid KQL. The correct aggregation function is 'summarize count() by' or 'summarize sum(CounterValue) by'."
      },
    ],
    correctOptionId: "A",
    explanation: "The correct KQL pattern for this scenario is: filter on time range and metric counter name first (using 'where'), then aggregate with 'summarize sum() by', then select the top 5 with 'top 5 by ... desc'. Option A is the only query that applies the time filter before aggregation and uses the correct syntax."
  }),

  choiceQuestion({
    id: "Q2344",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Tailwind",
    scenario: "A team wants to receive an email notification and trigger an Azure Function when a virtual machine in a resource group is stopped. They have already identified the relevant Azure Monitor alert rule. They now need to define who receives the notification and what action is triggered.",
    stem: "What should you create to configure the email notification and Azure Function trigger?",
    subtopic: "Configure alerts in Azure Monitor",
    referenceTopic: "Azure Monitor  action groups for alert notifications",

    hint: "Action groups define notification/remediation actions (email, SMS, webhooks, Functions, Logic Apps). Create one, attach to alert rule; reusable across multiple rules.",
    options: [
      {
        id: "A",
        text: "An alert rule with email and Azure Function specified directly in the alert rule conditions.",
        rationale: "Incorrect. Alert rule conditions define when the alert fires; they do not specify notification or action destinations."
      },
      {
        id: "B",
        text: "An action group that includes an email notification action and an Azure Function action, and attach it to the alert rule.",
        rationale: "Correct. Action groups are the Azure Monitor mechanism for defining a set of notification and remediation actions. An action group can combine email contacts and Azure Function triggers, and be attached to one or more alert rules."
      },
      {
        id: "C",
        text: "An Azure Logic App that is triggered by the alert rule directly, with email and Function call steps.",
        rationale: "Incorrect. While an action group can trigger a Logic App, an alert rule cannot directly trigger a Logic App without an action group. Additionally, the simplest solution for email + Function is an action group, not a Logic App."
      },
      {
        id: "D",
        text: "A diagnostic setting on the VM that exports logs to an Event Hub connected to Azure Functions.",
        rationale: "Incorrect. Diagnostic settings export logs for analysis; they do not implement alert-driven notification workflows."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Monitor action groups define the actions taken when an alert fires. A single action group can include multiple actions of different types: email/SMS notifications, webhook calls, Azure Function invocations, Logic App triggers, and more. Action groups are reusable and can be attached to multiple alert rules."
  }),

  choiceQuestion({
    id: "Q2345",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Fabrikam",
    scenario: "A production application uses Application Insights SDK-based telemetry collection. At peak load, the application generates approximately 2,000 telemetry events per second, resulting in ingest costs of approximately $10,000 per month. The development team is concerned about rising telemetry ingestion costs and wants to reduce the volume without modifying application code. It is critical that all operation types (successful requests, failed requests, exceptions, dependencies) remain proportionally represented in the sampled data.",
    stem: "Which Application Insights feature should you configure?",
    subtopic: "Configure Application Insights monitoring",
    referenceTopic: "Application Insights  adaptive sampling",

    hint: "Adaptive sampling auto-adjusts the sampling percentage (e.g., 50% → 10%) to target a maximum telemetry rate. All operation types remain proportionally represented.",
    options: [
      {
        id: "A",
        text: "Enable adaptive sampling in the Application Insights SDK configuration.",
        rationale: "Correct. Adaptive sampling automatically adjusts the telemetry sampling rate based on the actual volume of data, reducing ingestion while preserving statistically representative samples of all request types and operation outcomes."
      },
      {
        id: "B",
        text: "Configure a daily cap on the Application Insights workspace to limit total data ingestion.",
        rationale: "Incorrect. A daily cap stops all telemetry ingestion after the cap is reached for the day, causing a complete data gap. This is not the same as representative sampling."
      },
      {
        id: "C",
        text: "Enable fixed-rate sampling at 10% in the Application Insights portal.",
        rationale: "Partially correct  fixed-rate sampling at 10% would reduce volume, but it requires configuration effort and may over-sample during low-traffic periods and under-sample during spikes. Adaptive sampling dynamically adjusts the rate."
      },
      {
        id: "D",
        text: "Use Azure Monitor ingestion transformation rules to filter out low-priority telemetry before it reaches Application Insights.",
        rationale: "Incorrect. Ingestion transformation rules apply to workspace-based Application Insights (Log Analytics-backed) and operate at the workspace level; they drop specific records entirely rather than providing statistical sampling."
      },
    ],
    correctOptionId: "A",
    explanation: "Adaptive sampling in the Application Insights SDK automatically adjusts the sampling percentage (e.g., from 50% to 10% or lower) to target a configured maximum telemetry rate (e.g., 500 events per second). It reduces costs during high-volume periods while ensuring that all operation types (successes, failures, exceptions, dependencies) are represented proportionally in the sampled set. The sampling rate adapts automatically; no code changes are required beyond initial SDK configuration."
  }),

  choiceQuestion({
    id: "Q2346",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind",
    scenario: "A FinOps team is reviewing Azure Cost Management features to detect sudden unexpected spending increases. They want to be alerted when actual or forecasted spending deviates significantly from expected patterns without configuring a fixed spending threshold.",
    stem: "Which Azure Cost Management feature uses machine learning to detect unexpected spending patterns without requiring a fixed threshold?",
    subtopic: "Configure Azure Cost Management",
    referenceTopic: "Azure Cost Management  anomaly detection alerts",

    hint: "Azure Cost Management anomaly detection uses machine learning to learn normal spending patterns and alert on significant deviations—no fixed threshold configuration needed.",
    options: [
      {
        id: "A",
        text: "Budget alerts with a percentage threshold",
        rationale: "Incorrect. Budget alerts use a fixed threshold (e.g., 80% of budget); they do not use machine learning for pattern detection."
      },
      {
        id: "B",
        text: "Anomaly detection alerts in Azure Cost Management",
        rationale: "Correct. Azure Cost Management anomaly detection uses machine learning to learn normal spending patterns and generates alerts when actual spending deviates significantly from expected patterns  without requiring manual threshold configuration."
      },
      {
        id: "C",
        text: "Cost analysis with a custom query filter for unexpected charges",
        rationale: "Incorrect. Cost analysis is a manual investigation tool, not an automated alerting mechanism."
      },
      {
        id: "D",
        text: "Azure Advisor cost recommendations",
        rationale: "Incorrect. Azure Advisor makes optimization recommendations (e.g., right-size VMs) but does not monitor spending anomalies in real time."
      },
    ],
    correctOptionId: "B",
    explanation: "Azure Cost Management anomaly detection uses machine learning models trained on historical spending data. It identifies significant deviations from the expected spending pattern and sends email alerts to subscription owners or defined recipients. Unlike budget alerts, no fixed dollar threshold needs to be configured."
  }),

  multiSelectQuestion({
    id: "Q2347",
    domain: "D5",
    type: "multi-select",
    difficulty: "medium",
    company: "Contoso",
    scenario: "A Windows Server VM is in the production subscription. The VM must only receive operating system patches during a specific maintenance window controlled by the operations team. The team wants to use Azure Update Manager to achieve this. Automatic patching outside the maintenance window must be disabled.",
    stem: "Which TWO configurations are required to enforce patch-only-in-maintenance-window behavior using Azure Update Manager?",
    subtopic: "Manage virtual machine updates by using Azure Update Manager",
    referenceTopic: "Update Manager  maintenance configurations and manual patch orchestration mode",

    hint: "Two settings required: (1) maintenance configuration defines the allowed schedule, (2) Manual patch orchestration disables Azure-initiated patching outside the window.",
    options: [
      {
        id: "A",
        text: "Create a maintenance configuration in Azure Update Manager with the desired schedule and associate the VM with it.",
        rationale: "Correct. A maintenance configuration defines when patching can occur. Associating the VM with it means Update Manager will only patch the VM during the configured window."
      },
      {
        id: "B",
        text: "Set the VM's patch orchestration mode to 'Manual' (Customer Managed Schedules) in the VM's Update settings in Azure Update Manager.",
        rationale: "Correct. Without setting the patch orchestration mode to 'Manual', Azure may still apply patches automatically (e.g., during automatic OS upgrades). Setting it to 'Manual' disables platform-initiated patching outside the maintenance window."
      },
      {
        id: "C",
        text: "Disable the Windows Update service inside the guest OS of the VM.",
        rationale: "Incorrect. Disabling the Windows Update service inside the guest breaks Update Manager's ability to apply patches at all, including during the maintenance window."
      },
      {
        id: "D",
        text: "Configure an Azure Policy to deny OS update deployments outside business hours.",
        rationale: "Incorrect. There is no built-in Azure Policy definition for blocking OS patch deployments by time. Maintenance configurations are the correct mechanism."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "Enforcing maintenance-window-only patching requires both a maintenance configuration (which defines the allowed schedule) and setting the VM's patch orchestration mode to Manual. Without the orchestration mode change, Azure-initiated automatic patching may still occur outside the window."
  }),

  yesNoQuestion({
    id: "Q2348",
    domain: "D5",
    type: "yes-no",
    difficulty: "easy",
    company: "Proseware",
    scenario: "You are reviewing Azure Advisor capabilities for a governance review. Evaluate the following statements about Azure Advisor.",
    stem: "For each statement, select Yes if the statement is true. Otherwise, select No.",
    subtopic: "Monitor resources by using Azure Advisor",
    referenceTopic: "Azure Advisor  recommendation categories, snooze, and auto-remediation",

    hint: "Azure Advisor provides 5 categories: Cost, Security, Reliability, Operational Excellence, and Performance. Recommendations can be snoozed; most require manual action.",
    statements: [
      {
        id: "S1",
        text: "Azure Advisor provides recommendations across five categories: Cost, Security, Reliability, Operational Excellence, and Performance.",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "An Azure Advisor recommendation can be snoozed for a specified period so it does not appear in the recommendations list until the snooze period expires.",
        answer: "Yes"
      },
      {
        id: "S3",
        text: "Azure Advisor can automatically remediate all recommendations without any manual approval.",
        answer: "No"
      },
    ],
    explanation: "Advisor has five pillars: Cost, Security, Reliability, Operational Excellence, and Performance  True. Recommendations can be snoozed (temporarily dismissed) for a specified period  True. Advisor does not automatically remediate all recommendations; while some recommendations offer a quick-fix button, the majority require manual review and action by an administrator  False."
  }),

  choiceQuestion({
    id: "Q2349",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Woodgrove",
    scenario: "Woodgrove Bank uses Azure Site Recovery to protect production VMs and their data replicated to a secondary region. The current DR configuration has an RPO of 15 minutes, meaning up to 15 minutes of recent transaction data could be lost in a failover scenario. The CTO wants to reduce the RPO to 5 minutes for a tier-1 workload to minimize potential data loss. An engineer proposes that reducing the RPO from 15 to 5 minutes will also reduce the RTO and may increase storage costs on the recovery side.",
    stem: "Which statements in the engineer's proposal are accurate?",
    subtopic: "Manage site recovery and backups",
    referenceTopic: "Azure Site Recovery  RPO vs RTO and cost implications",

    hint: "RPO and RTO are independent dimensions. Lower RPO requires more frequent replication checkpoints, increasing recovery point storage. RTO depends on failover process and boot time.",
    options: [
      {
        id: "A",
        text: "Reducing the RPO from 15 minutes to 5 minutes does not change the RTO; however, more frequent replication checkpoints may increase the storage costs for recovery points.",
        rationale: "Correct. RPO (how much data can be lost) is independent of RTO (how quickly the system can be restored after a failover). More frequent checkpoints create more recovery point snapshots, increasing storage consumption."
      },
      {
        id: "B",
        text: "Reducing the RPO automatically reduces the RTO because failover is initiated more quickly.",
        rationale: "Incorrect. RTO (time to restore service after disaster) is determined by the failover and recovery process (VM boot time, application startup, DNS propagation, network reconfiguration), not by the frequency of replication checkpoints. Reducing RPO (checkpoint frequency) does not accelerate the recovery process itself."
      },
      {
        id: "C",
        text: "Reducing the RPO has no impact on storage costs because Site Recovery stores only the latest recovery point.",
        rationale: "Incorrect. Lower RPO requires MORE frequent replication checkpoints, not fewer. More frequent checkpoints create additional crash-consistent and app-consistent recovery point snapshots, increasing storage consumption on the recovery site."
      },
      {
        id: "D",
        text: "Reducing the RPO to 5 minutes requires upgrading the Site Recovery replication appliance to a Premium SKU.",
        rationale: "Incorrect. RPO is a replication frequency setting (how often checkpoints occur), not tied to a Site Recovery appliance SKU. Appliance SKU determines replication throughput capacity; RPO is configured independently via policy."
      },
    ],
    correctOptionId: "A",
    explanation: "RPO (Recovery Point Objective) and RTO (Recovery Time Objective) are independent SLA dimensions in disaster recovery. RPO measures maximum acceptable data loss and is directly tied to replication checkpoint frequency; lower RPO requires more frequent checkpoints (e.g., every 5 minutes instead of 15), creating more recovery point snapshots and increasing storage. RTO measures time to restore full service after a disaster and depends on failover process, VM boot time, and application startup  not on checkpoint frequency. Therefore, reducing RPO from 15 to 5 minutes will NOT reduce RTO, but it will increase recovery point storage costs."
  }),

  dragDropQuestion({
    id: "Q2350",
    domain: "D5",
    type: "drag-drop",
    difficulty: "medium",
    company: "Proseware",
    scenario: "You are creating an Azure Monitor Workbook that displays VM CPU and memory metrics over the past 7 days. After building the workbook, you need to share it with management by pinning it to an Azure dashboard.",
    stem: "Arrange the steps in the correct order to create and share the workbook.",
    subtopic: "Monitor resources by using Azure Monitor Workbooks",
    referenceTopic: "Azure Monitor Workbooks  creation, save, and pin to dashboard workflow",

    hint: "Workbook creation workflow: Navigate to Azure Monitor Workbooks > Create > Add queries and set time range > Save the workbook > Then pin tiles to dashboard.",
    availableItems: [
    "Pin the workbook (or individual tiles) to an Azure shared dashboard",
    "Add query steps for CPU and memory metrics and configure the time range to last 7 days",
    "Navigate to Azure Monitor and open the Workbooks blade, then create a new workbook",
    "Save the workbook"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Navigate to Azure Monitor and open the Workbooks blade, then create a new workbook",
      "Add query steps for CPU and memory metrics and configure the time range to last 7 days",
      "Save the workbook",
      "Pin the workbook (or individual tiles) to an Azure shared dashboard",
    ],
    explanation: "You must first navigate to Azure Monitor Workbooks and create a new workbook, then add the query steps and configure the time range, then save the workbook so it persists, and finally pin it or its tiles to a shared dashboard for management access."
  }),


  //  Supplemental questions to satisfy 5-run pool capacity 

  // Case Study: Woodgrove Bank (Q2351Q2355)  one question per domain
  choiceQuestion({
    id: "Q2351",
    domain: "D1",
    type: "case-study",
    difficulty: "medium",
    company: "Woodgrove Bank",
    scenario: "Case study: Woodgrove Bank requires that database administrator access to production SQL databases is activated just-in-time and approved by the DBA manager before access is granted.",
    stem: "Which Microsoft Entra PIM configuration satisfies both the just-in-time and approval requirements for the DBA team?",
    subtopic: "Manage Microsoft Entra Privileged Identity Management",
    referenceTopic: "PIM eligible assignments with approval workflow",

    hint: "In PIM, eligible assignments require activation—including optional approval steps—while permanent assignments grant access continuously. Distinguish which activation controls satisfy just-in-time and approval requirements simultaneously.",
    caseStudyId: "CS-WOODGROVE-BANK",
    options: [
      {
        id: "A",
        text: "Create an eligible SQL DB Contributor role assignment for the DBA team security group, configure a maximum activation duration of 8 hours, and require approval by the DBA manager.",
        rationale: "Correct. An eligible assignment requires activation. Requiring manager approval satisfies the approval step. The 8-hour maximum duration scopes each activation."
      },
      {
        id: "B",
        text: "Create a permanent SQL DB Contributor assignment and enable the DBA manager as an access reviewer.",
        rationale: "Incorrect. A permanent assignment grants continuous access. Access reviewers periodically validate access but do not provide just-in-time gating."
      },
      {
        id: "C",
        text: "Create an eligible assignment with MFA enforcement only; approval is not required.",
        rationale: "Incorrect. MFA enforces authentication strength but does not involve a second person reviewing and approving the activation request."
      },
      {
        id: "D",
        text: "Assign the DBA manager as a Privileged Role Administrator so they can grant access on demand.",
        rationale: "Incorrect. Privileged Role Administrator is an Entra ID role for managing role assignments, not an approval mechanism for PIM activation requests."
      },
    ],
    correctOptionId: "A",
    explanation: "PIM eligible assignments require activation. Setting the activation to require approver approval means no access is granted until the designated approver (DBA manager) explicitly approves the request. The eligible model combined with approval workflow is the JIT + human-approval pattern."
  }),

  choiceQuestion({
    id: "Q2352",
    domain: "D2",
    type: "case-study",
    difficulty: "medium",
    company: "Woodgrove Bank",
    scenario: "Case study: Woodgrove Bank's regulatory framework requires that all storage accounts holding customer transaction records use customer-managed keys in Azure Key Vault, and the key vault must be protected from accidental permanent key deletion.",
    stem: "Which two Key Vault features must be enabled to meet these requirements?",
    subtopic: "Configure storage account encryption",
    referenceTopic: "Customer-managed keys and Key Vault soft delete with purge protection",

    hint: "Soft delete retains deleted Key Vault objects within a configurable recovery window, while purge protection prevents permanent deletion during that period even by administrators. Both features together prevent accidental or malicious data destruction.",
    caseStudyId: "CS-WOODGROVE-BANK",
    options: [
      {
        id: "A",
        text: "Enable soft delete and purge protection on the Key Vault.",
        rationale: "Correct. Soft delete retains deleted keys for a retention period. Purge protection prevents permanent deletion during the retention period, satisfying the accidental deletion protection requirement."
      },
      {
        id: "B",
        text: "Enable Key Vault logging and configure a Log Analytics workspace.",
        rationale: "Incorrect. Logging provides audit visibility but does not prevent key deletion."
      },
      {
        id: "C",
        text: "Configure automatic key rotation for all customer-managed keys.",
        rationale: "Incorrect. Automatic rotation keeps keys fresh but does not protect against accidental permanent deletion."
      },
      {
        id: "D",
        text: "Enable Key Vault firewall to restrict access to the Key Vault's public endpoint.",
        rationale: "Incorrect. Firewall settings control network access, not protection against key deletion inside the vault."
      },
    ],
    correctOptionId: "A",
    explanation: "Azure Key Vault soft delete protects keys (and vaults) from immediate permanent deletion by placing them in a recoverable deleted state. Purge protection blocks the 'purge' operation that would permanently remove a soft-deleted key before the retention period expires. Both are required for deletion protection compliance."
  }),

  choiceQuestion({
    id: "Q2353",
    domain: "D3",
    type: "case-study",
    difficulty: "medium",
    company: "Woodgrove Bank",
    scenario: "Case study: Woodgrove Bank runs a batch transaction reconciliation workload on a Virtual Machine Scale Set. Peak batch volumes arrive at market close (17:00 daily). The team wants to pre-scale the VMSS to maximum capacity at 16:45 and scale back down at 19:00 after processing completes.",
    stem: "Which autoscale mechanism should you configure?",
    subtopic: "Configure Azure Virtual Machine scale sets",
    referenceTopic: "VMSS autoscale  schedule-based scaling profiles",

    hint: "When batch job windows are known in advance, schedule-based autoscale pre-provisions capacity before demand arrives—eliminating the cold-start lag that metric-triggered reactive scaling would introduce for predictable workloads.",
    caseStudyId: "CS-WOODGROVE-BANK",
    options: [
      {
        id: "A",
        text: "Configure a metric-based scale-out rule triggered when CPU exceeds 70%.",
        rationale: "Incorrect. Metric-based scaling reacts after the load has already arrived, introducing latency. Pre-scaling requires schedule-based profiles."
      },
      {
        id: "B",
        text: "Create a recurring schedule-based autoscale profile that scales to maximum capacity at 16:45 and reduces at 19:00.",
        rationale: "Correct. Schedule-based autoscale profiles allow you to define the instance count at specific times of day on a recurring schedule, enabling pre-scaling before the batch window."
      },
      {
        id: "C",
        text: "Manually scale the VMSS before and after each batch window via an Azure Automation runbook.",
        rationale: "Correct conceptually but not the purpose-built answer. Autoscale schedule profiles are the native, preferred solution without custom automation code."
      },
      {
        id: "D",
        text: "Configure a scale-in rule that reduces instances when CPU falls below 20%.",
        rationale: "Incorrect. Scale-in rules reduce capacity after demand drops; they do not enable pre-scaling before a predictable event."
      },
    ],
    correctOptionId: "B",
    explanation: "VMSS autoscale supports schedule-based profiles that set a fixed instance count during defined time windows. This is the correct tool for predictable, time-driven workloads where pre-scaling before peak is needed."
  }),

  choiceQuestion({
    id: "Q2354",
    domain: "D4",
    type: "case-study",
    difficulty: "hard",
    company: "Woodgrove Bank",
    scenario: "Case study: Woodgrove Bank's core banking application connects to Azure SQL Database from an application subnet. Regulatory requirements mandate that SQL traffic must not traverse the public internet. The SQL Database firewall is set to 'Deny all' public access.",
    stem: "Which networking configuration routes SQL traffic privately between the application subnet and Azure SQL Database?",
    subtopic: "Configure private endpoints",
    referenceTopic: "Azure Private Link for Azure SQL Database",

    hint: "A private endpoint assigns a private IP address from your VNet to a PaaS service, routing traffic entirely over the Azure backbone. Without a corresponding private DNS zone entry, the service FQDN still resolves to its public IP, bypassing the private path.",
    caseStudyId: "CS-WOODGROVE-BANK",
    options: [
      {
        id: "A",
        text: "Create a private endpoint for Azure SQL Database in the application VNet and configure a private DNS zone for database.windows.net linked to the VNet.",
        rationale: "Correct. A private endpoint assigns a private IP to SQL Database within the VNet. A private DNS zone resolves the SQL FQDN to that private IP, ensuring all traffic stays on the Microsoft backbone."
      },
      {
        id: "B",
        text: "Enable a service endpoint for SQL on the application subnet and add the subnet to the SQL firewall allowed networks.",
        rationale: "Incorrect. Service endpoints optimize routing over the backbone but traffic still uses the SQL public endpoint IP. The SQL firewall is set to deny public access, so a private endpoint is required."
      },
      {
        id: "C",
        text: "Deploy a network virtual appliance in the application subnet to proxy SQL traffic.",
        rationale: "Incorrect. An NVA proxy would still need to reach SQL Database over some path and adds unnecessary complexity. Private Link is the designed solution."
      },
      {
        id: "D",
        text: "Configure an outbound NSG rule allowing port 1433 from the application subnet.",
        rationale: "Incorrect. NSG rules control allowed traffic but do not create a private connectivity path. Without a private endpoint, port 1433 traffic would reach the public endpoint."
      },
    ],
    correctOptionId: "A",
    explanation: "Azure Private Link creates a private endpoint NIC in the application VNet with a private IP assigned from the subnet. DNS resolution via a private DNS zone ensures the SQL FQDN resolves to the private IP. Traffic never leaves the Microsoft backbone."
  }),

  choiceQuestion({
    id: "Q2355",
    domain: "D5",
    type: "case-study",
    difficulty: "medium",
    company: "Woodgrove Bank",
    scenario: "Case study: The Woodgrove Bank operations team needs a unified dashboard showing Azure VM health, storage account capacity, and SQL Database DTU utilization over the past 30 days, available to all operations team members without giving them write access to Azure resources.",
    stem: "Which Azure service should you use to create and share this multi-resource dashboard?",
    subtopic: "Monitor resources by using Azure Monitor Workbooks",
    referenceTopic: "Azure Monitor Workbooks  shared dashboards for multi-resource monitoring",

    hint: "Azure Monitor Workbooks support parameterized, interactive reports that aggregate metrics, logs, and resource data from multiple Azure resources into a single shareable view—distinct from static dashboards or external BI tools.",
    caseStudyId: "CS-WOODGROVE-BANK",
    options: [
      {
        id: "A",
        text: "Azure Monitor Workbooks shared to the operations team's resource group.",
        rationale: "Correct. Azure Monitor Workbooks can aggregate metrics from multiple resources and services. They can be saved to a resource group and shared with read-only access, giving the operations team a unified view without write permissions."
      },
      {
        id: "B",
        text: "Azure Service Health dashboard.",
        rationale: "Incorrect. Service Health shows Azure platform health events (outages, maintenance), not per-resource metric dashboards."
      },
      {
        id: "C",
        text: "A custom Power BI report connected to Azure Resource Graph.",
        rationale: "Partially possible but requires additional tooling outside of native Azure Monitor. Azure Monitor Workbooks is the native, first-party solution."
      },
      {
        id: "D",
        text: "Azure Cost Management dashboard filtered by resource type.",
        rationale: "Incorrect. Cost Management shows spending data, not operational health metrics like CPU, storage capacity, or DTU."
      },
    ],
    correctOptionId: "A",
    explanation: "Azure Monitor Workbooks natively query Log Analytics, Azure Monitor metrics, Azure Resource Graph, and other sources. They can be saved and shared within a resource group with Reader access, making them the ideal tool for a multi-resource operational dashboard."
  }),

  // Supplemental non-case-study questions to close type/domain gaps

  multiSelectQuestion({
    id: "Q2356",
    domain: "D1",
    type: "multi-select",
    difficulty: "hard",
    company: "Adatum",
    scenario: "A security team wants to ensure that only compliant devices from managed networks can access the Azure portal. Additionally, users with the Global Administrator role must always complete MFA regardless of network location. You are designing the Conditional Access policies.",
    stem: "Which TWO Conditional Access policy configurations are required to satisfy both requirements?",
    subtopic: "Manage Conditional Access policies",
    referenceTopic: "Conditional Access  device compliance, named locations, and per-role MFA enforcement",

    hint: "Conditional Access policies can target specific cloud apps or directory roles independently. Combining a compliance-and-location policy for portal access with a separate MFA-enforcement policy for privileged roles addresses two distinct risk surfaces.",
    options: [
      {
        id: "A",
        text: "Create a policy targeting 'All users' for the Azure portal cloud app, requiring device compliance AND a trusted network location as conditions for access.",
        rationale: "Correct. This policy enforces both compliance and network origin for all Azure portal access."
      },
      {
        id: "B",
        text: "Create a separate policy targeting the 'Global Administrator' role for all cloud apps, requiring MFA as the grant control, with no location exclusion.",
        rationale: "Correct. A separate policy for Global Administrators requiring MFA with no location exception ensures MFA is always required regardless of network, satisfying the unconditional MFA requirement."
      },
      {
        id: "C",
        text: "Configure a single policy that grants access unconditionally to users on trusted networks and blocks everyone else.",
        rationale: "Incorrect. This bypasses device compliance for trusted network users and does not enforce per-role MFA."
      },
      {
        id: "D",
        text: "Enable Security Defaults on the tenant to satisfy all requirements with a single configuration.",
        rationale: "Incorrect. Security Defaults provide a baseline but cannot be customized to enforce device compliance or per-app/per-location restrictions."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "Two separate policies are needed: one for the Azure portal requiring device compliance AND trusted location for all users, and one specifically for Global Administrators requiring MFA unconditionally (no location exception). A single policy cannot cover both requirements cleanly."
  }),

  yesNoQuestion({
    id: "Q2357",
    domain: "D1",
    type: "yes-no",
    difficulty: "medium",
    company: "Contoso",
    scenario: "You are reviewing Azure RBAC scope inheritance and role assignment behavior. Evaluate the following statements.",
    stem: "For each statement, select Yes if the statement is true. Otherwise, select No.",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Azure RBAC  scope inheritance and deny assignments",

    hint: "RBAC role assignments propagate downward through the management group, subscription, and resource group hierarchy. Deny assignments are absolute and cannot be overridden by any allow assignment at a lower or equal scope.",
    statements: [
      {
        id: "S1",
        text: "A role assignment at a management group scope is inherited by all subscriptions, resource groups, and resources below it in the hierarchy.",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "A deny assignment created at the subscription scope can be overridden by an allow role assignment at the resource group scope.",
        answer: "No"
      },
      {
        id: "S3",
        text: "A user with a Reader role at the subscription scope and a Contributor role on a specific resource group has Contributor permissions only within that resource group.",
        answer: "Yes"
      },
    ],
    explanation: "Scope inheritance: RBAC role assignments propagate down the hierarchy  True. Deny assignments: deny always wins regardless of allow assignments at any scope  False. Combining roles: RBAC is additive; Reader + Contributor on a specific resource group means Contributor for that group and Reader elsewhere  True."
  }),

  multiSelectQuestion({
    id: "Q2358",
    domain: "D2",
    type: "multi-select",
    difficulty: "hard",
    company: "Northwind",
    scenario: "A security review found that a storage account containing sensitive customer records has public access enabled and is using storage account key-based authentication. The security team needs to harden the storage account. Two immediate changes are required.",
    stem: "Which TWO changes should you make immediately to reduce the attack surface of the storage account?",
    subtopic: "Configure storage account security",
    referenceTopic: "Storage account security  public access, SAS, and Entra-based auth",

    hint: "Two independent attack surfaces require separate controls: disabling public blob access closes anonymous data-plane exposure, while disabling shared key authentication removes the risk of credential theft that grants full account-level access.",
    options: [
      {
        id: "A",
        text: "Set the storage account's 'Allow Blob public access' property to 'Disabled'.",
        rationale: "Correct. Disabling anonymous public access ensures that containers cannot be made public, requiring authentication for all access."
      },
      {
        id: "B",
        text: "Disable shared key access on the storage account and configure applications to use Microsoft Entra-based authentication.",
        rationale: "Correct. Disabling shared key access prevents the use of storage account keys and SAS tokens signed by those keys, requiring Entra-based OAuth tokens instead  which support conditional access, MFA, and revocation."
      },
      {
        id: "C",
        text: "Rotate the storage account keys to invalidate any existing keys.",
        rationale: "Incorrect. Rotating keys is a reactive measure; the underlying problem is that key-based auth remains enabled. Disabling shared key access is the more secure posture."
      },
      {
        id: "D",
        text: "Move the storage account to a different Azure region.",
        rationale: "Incorrect. Moving regions does not change authentication or public access settings."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "The two highest-impact immediate hardening steps are: (1) disabling blob public access to prevent anonymous reads, and (2) disabling shared key authorization to force Entra-based authentication with proper identity governance and revocation capabilities."
  }),

  multiSelectQuestion({
    id: "Q2359",
    domain: "D3",
    type: "multi-select",
    difficulty: "hard",
    company: "Fabrikam",
    scenario: "A development team is designing an Azure Kubernetes Service (AKS) cluster to host both CPU-intensive ML inference workloads and lightweight API containers. The ML inference pods require GPU nodes. The API pods do not need GPUs and should not be scheduled on GPU nodes to avoid wasting expensive resources.",
    stem: "Which TWO AKS features should you use to achieve this node-workload separation?",
    subtopic: "Configure and manage containerized workloads",
    referenceTopic: "AKS node pools and Kubernetes taints/tolerations",

    hint: "In Kubernetes, taints repel pods from scheduling on a node unless the pod carries a matching toleration. Both the taint on the GPU node pool and the toleration in the ML pod spec are required to achieve deterministic workload isolation.",
    options: [
      {
        id: "A",
        text: "Create a dedicated GPU node pool for ML workloads and apply a taint (e.g., gpu=true:NoSchedule) to the GPU node pool.",
        rationale: "Correct. A separate GPU node pool isolates the GPU nodes. A taint prevents regular pods from being scheduled on GPU nodes unless they have a matching toleration."
      },
      {
        id: "B",
        text: "Add a toleration to the ML inference pod spec that matches the GPU node pool's taint.",
        rationale: "Correct. Only ML inference pods with the matching toleration will be allowed to schedule on the tainted GPU node pool, ensuring GPU nodes are reserved for GPU workloads."
      },
      {
        id: "C",
        text: "Use AKS cluster autoscaler to automatically move API pods off GPU nodes.",
        rationale: "Incorrect. The cluster autoscaler manages node count based on pending pods, not pod placement decisions. Taints/tolerations control scheduling."
      },
      {
        id: "D",
        text: "Configure a Kubernetes NetworkPolicy to prevent API pods from communicating with GPU nodes.",
        rationale: "Incorrect. NetworkPolicy controls network traffic between pods, not scheduling placement on specific node pools."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "Node pool taints prevent unintended scheduling (NoSchedule means pods without a toleration cannot be scheduled on the node). Only pods with the matching toleration are allowed. Together, a tainted GPU node pool and ML pod tolerations create the required workload isolation."
  }),

  yesNoQuestion({
    id: "Q2360",
    domain: "D3",
    type: "yes-no",
    difficulty: "medium",
    company: "Proseware",
    scenario: "Your development team is migrating on-premises CI/CD pipelines to Azure DevOps and planning to store container images in Azure Container Registry (ACR). Evaluate the following statements about which ACR capabilities will automate image builds and trigger downstream deployments.",
    stem: "For each statement, select Yes if the statement is true. Otherwise, select No.",
    subtopic: "Configure container registry",
    referenceTopic: "Azure Container Registry  tasks, webhooks, and content trust",

    hint: "ACR Tasks trigger automated image builds on Git commits, and webhooks notify external systems on registry events. However, geo-replication to additional regions is never automatic—it must be explicitly enabled per target region.",
    statements: [
      {
        id: "S1",
        text: "Azure Container Registry Tasks can automatically build and push a container image when code is committed to a linked Git repository.",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "An ACR webhook can trigger an external service (such as a CI/CD pipeline) when an image is pushed to the registry.",
        answer: "Yes"
      },
      {
        id: "S3",
        text: "Images pushed to Azure Container Registry are stored in the same Azure region as the registry and are never replicated unless geo-replication is explicitly enabled.",
        answer: "Yes"
      },
    ],
    explanation: "ACR Tasks support Git-triggered image builds via source code triggers  True. ACR webhooks fire HTTP POST notifications to configured endpoints on push, delete, and chart push events  True. Images are stored in the registry's home region by default; geo-replication to additional regions must be explicitly configured  True."
  }),

  choiceQuestion({
    id: "Q2361",
    domain: "D3",
    type: "hot-area",
    difficulty: "medium",
    company: "Tailwind",
    scenario: "An Azure App Service web application is deployed to a Standard S2 plan. The application team wants to configure the application to always have a minimum of 2 instances and a maximum of 8 instances, with autoscale triggering scale-out when average CPU exceeds 70% over a 5-minute period.",
    stem: "In the App Service Plan's Scale out (App Service plan) blade, which section should you navigate to first to configure this behavior?",
    subtopic: "Configure Azure App Service",
    referenceTopic: "App Service  autoscale settings on App Service plan",

    hint: "The Custom autoscale section in the Scale out blade enables condition-based rules that combine metric thresholds, time schedules, and minimum/maximum instance limits—capabilities not available under simple manual or fixed-count scaling options.",
    options: [
      {
        id: "A",
        text: "Custom autoscale",
        rationale: "Correct. The 'Custom autoscale' option in the Scale out blade allows you to define minimum and maximum instance counts and configure metric-based scale rules with thresholds."
      },
      {
        id: "B",
        text: "Manual scale",
        rationale: "Incorrect. Manual scale sets a fixed instance count and does not support automatic metric-based scaling."
      },
      {
        id: "C",
        text: "Scale to specific instance count",
        rationale: "Incorrect. This is not a UI option in the App Service Scale out blade. It describes manual scale behavior."
      },
      {
        id: "D",
        text: "Scale based on a schedule only",
        rationale: "Incorrect. Schedule-only scaling uses time-based profiles, not CPU metric triggers."
      },
    ],
    correctOptionId: "A",
    explanation: "In the App Service Plan Scale out blade, selecting 'Custom autoscale' reveals the minimum and maximum instance settings and allows adding metric-based rules (e.g., CPU > 70% for 5 minutes triggers scale-out). This is the correct starting point for configuring auto-scaling behavior."
  }),

  choiceQuestion({
    id: "Q2362",
    domain: "D3",
    type: "hot-area",
    difficulty: "medium",
    company: "Contoso",
    scenario: "A Virtual Machine Scale Set (VMSS) has a custom autoscale profile. The profile has a scale-out rule: scale out by 2 instances when CPU > 80% for 10 minutes, and a scale-in rule: scale in by 1 instance when CPU < 20% for 10 minutes. The instance count is currently at the minimum (2). CPU has been above 80% for the past 20 minutes. After the first scale-out event fires, how many instances will the VMSS have?",
    stem: "Which answer correctly describes the instance count immediately after the FIRST scale-out event?",
    subtopic: "Configure Azure Virtual Machine scale sets",
    referenceTopic: "VMSS autoscale  scale-out increment and cooldown",

    hint: "VMSS scale-out rules increment the instance count by a fixed step size when the trigger condition is met. Apply the configured step increase to the current running count, noting that the cooldown period prevents additional scaling events immediately after.",
    options: [
      {
        id: "A",
        text: "4 instances",
        rationale: "Correct. The scale-out rule adds 2 instances to the current count of 2, resulting in 4 instances. The cooldown period then prevents additional scale-out events."
      },
      {
        id: "B",
        text: "3 instances",
        rationale: "Incorrect. The rule adds 2 instances (not 1), so 2 + 2 = 4."
      },
      {
        id: "C",
        text: "2 instances (no change)",
        rationale: "Incorrect. The scale-out condition (CPU > 80% for 10 minutes) has been met for 20 minutes, so the rule has fired."
      },
      {
        id: "D",
        text: "6 instances",
        rationale: "Incorrect. Only one scale-out event fires at a time; the cooldown period prevents immediate repeat scaling. A second event might fire after the cooldown expires if CPU remains high."
      },
    ],
    correctOptionId: "A",
    explanation: "When an autoscale scale-out rule fires once, the configured increment (2 instances) is added to the current count (2), giving 4 total. After the scale-out event, the autoscale cooldown period prevents further scale actions until it expires."
  }),

  multiSelectQuestion({
    id: "Q2363",
    domain: "D4",
    type: "multi-select",
    difficulty: "hard",
    company: "Adatum",
    scenario: "A subnet hosts web VMs that must accept inbound HTTPS (port 443) from the internet. The VMs must also be able to reach an on-premises DNS server on port 53 via an ExpressRoute connection. All other inbound and outbound traffic must be blocked. You are designing the NSG rules.",
    stem: "Which TWO NSG rules (in addition to the default deny-all rules) are required to enable BOTH scenarios while blocking all other traffic?",
    subtopic: "Configure network security groups",
    referenceTopic: "NSG rule design  inbound and outbound allow rules",

    hint: "Two separate traffic flows each require an explicit NSG rule: inbound TCP 443 from the Internet service tag for public HTTPS access, and outbound TCP/UDP 53 to the on-premises DNS server IP for name resolution routed over ExpressRoute.",
    options: [
      {
        id: "A",
        text: "Inbound rule: Allow TCP port 443 from source 'Internet' to destination 'VirtualNetwork'.",
        rationale: "Correct. This allows inbound HTTPS from the internet to the VMs. Using the 'Internet' service tag as source covers all public IPs."
      },
      {
        id: "B",
        text: "Outbound rule: Allow TCP/UDP port 53 from source 'VirtualNetwork' to destination matching the on-premises DNS server IP or the 'VirtualNetwork' service tag.",
        rationale: "Correct. DNS queries use both UDP and TCP port 53. An outbound rule must explicitly allow this traffic since the default NSG outbound rules deny all traffic not matching an explicit allow (except the default 'allow outbound to internet' and 'allow VNet to VNet' defaults, but those defaults could be overridden)."
      },
      {
        id: "C",
        text: "Inbound rule: Allow all traffic from source 'VirtualNetwork'.",
        rationale: "Incorrect. Allowing all inbound traffic from VirtualNetwork would permit unauthorized internal traffic, violating the requirement to block all other traffic."
      },
      {
        id: "D",
        text: "Outbound rule: Allow all traffic to destination 'Internet' to enable DNS resolution over ExpressRoute.",
        rationale: "Incorrect. ExpressRoute is a private connection; traffic to on-premises does not go through 'Internet'. Also, allowing all outbound internet traffic violates the requirement."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "Two targeted rules cover both scenarios: (1) an inbound allow for HTTPS from the internet, and (2) an outbound allow for DNS port 53 to the on-premises server. The default NSG deny rules block all other traffic that doesn't match an explicit allow."
  }),

  multiSelectQuestion({
    id: "Q2364",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Litware",
    scenario: "Two Azure virtual networks in the same region (VNet-A and VNet-B) are connected via VNet peering. Resources in VNet-A cannot reach resources in VNet-B. A network engineer has verified that the peering status shows 'Connected' for both sides.",
    stem: "Which TWO additional issues should you investigate as likely causes of the connectivity failure?",
    subtopic: "Configure virtual network peering",
    referenceTopic: "VNet peering troubleshooting  NSG rules and overlapping address spaces",

    hint: "VNet peering creates routing adjacency but does not bypass NSG rules applied to subnets—traffic can still be dropped by security rules after the peering is established. Additionally, overlapping address spaces between peered VNets prevent peering from being configured at all.",
    options: [
      {
        id: "A",
        text: "NSG rules on either VNet-A's or VNet-B's subnets may be blocking traffic between the two VNets.",
        rationale: "Correct. VNet peering creates connectivity at the network layer, but NSG rules on source or destination subnets can still block traffic. NSG rules are the most common cause of 'peering is connected but traffic is blocked' issues."
      },
      {
        id: "B",
        text: "The address spaces of VNet-A and VNet-B may overlap, preventing routing.",
        rationale: "Correct. VNet peering requires non-overlapping address spaces. If the address spaces overlap, Azure will not create routing entries and traffic will not flow even with peering status showing 'Connected'."
      },
      {
        id: "C",
        text: "VNet peering requires the two VNets to be in the same subscription.",
        rationale: "Incorrect. VNet peering supports cross-subscription and cross-tenant peering. The same subscription is not a requirement."
      },
      {
        id: "D",
        text: "VNet peering requires a VPN gateway to be deployed in at least one VNet.",
        rationale: "Incorrect. VNet peering is a direct platform-level connection. It does not require a VPN gateway."
      },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation: "When VNet peering shows 'Connected' but traffic doesn't flow, the two most common causes are: (1) NSG rules blocking traffic on the source or destination subnet, and (2) overlapping address spaces that prevent proper routing between the VNets."
  }),

  yesNoQuestion({
    id: "Q2365",
    domain: "D5",
    type: "yes-no",
    difficulty: "medium",
    company: "Contoso",
    scenario: "You are reviewing Azure Monitor capabilities for a governance assessment. Evaluate the following statements about Azure Monitor.",
    stem: "For each statement, select Yes if the statement is true. Otherwise, select No.",
    subtopic: "Configure monitoring for Azure resources",
    referenceTopic: "Azure Monitor  metric retention, diagnostic settings, and alert types",

    hint: "Azure platform metrics are retained for 93 days natively; routing them to Log Analytics via diagnostic settings extends retention further. Metric alerts evaluate time-series data values—they cannot aggregate or count the number of currently active alerts.",
    statements: [
      {
        id: "S1",
        text: "Azure Monitor platform metrics for Azure resources are retained for 93 days by default without any configuration.",
        answer: "Yes"
      },
      {
        id: "S2",
        text: "Diagnostic settings on an Azure resource must be configured to send platform metrics to a Log Analytics workspace for long-term retention beyond 93 days.",
        answer: "Yes"
      },
      {
        id: "S3",
        text: "An Azure Monitor metric alert can be configured to fire when the number of active alerts in a resource group exceeds a threshold.",
        answer: "No"
      },
    ],
    explanation: "Platform metrics are retained by Azure Monitor for 93 days without configuration  True. To retain metrics beyond 93 days or perform custom KQL queries on metrics, they must be routed to a Log Analytics workspace via diagnostic settings  True. Azure Monitor metric alerts fire on resource-emitted metrics (e.g., CPU %, request count); the number of 'active alerts' is not a native Azure Monitor metric  False."
  }),
  //  Supplemental batch 2 (Q2366-Q2404): 35 questions to reach 300 total 

  // Case Study 6: CS-PROSEWARE-CLOUD (Q2366-Q2370)
  choiceQuestion({
    id: "Q2366", domain: "D1", type: "case-study", difficulty: "medium",
    company: "Proseware Ltd",
    scenario: "Case study: Proseware's security team is migrating from on-premises AD FS to Microsoft Entra cloud authentication. They want authentication processed entirely in the cloud without relying on any on-premises infrastructure.",
    stem: "Which Microsoft Entra authentication method allows immediate cloud-based authentication without any on-premises dependency?",
    subtopic: "Configure Microsoft Entra ID authentication methods",
    referenceTopic: "Entra cloud authentication  Password Hash Sync vs Pass-through Authentication",

    hint: "Password Hash Synchronization copies a hash of password hashes to Entra ID, enabling cloud-side authentication with no on-premises infrastructure required during sign-in. Pass-through Authentication, by contrast, requires an on-premises agent to validate credentials.",
    caseStudyId: "CS-PROSEWARE-CLOUD",
    options: [
      { id: "A", text: "Password Hash Synchronization (PHS)", rationale: "Correct. PHS synchronizes hashed passwords to Entra ID. Authentication is processed entirely in the cloud with no on-premises dependency." },
      { id: "B", text: "Active Directory Federation Services (AD FS)", rationale: "Incorrect. AD FS requires on-premises server infrastructure for authentication, which the team is moving away from." },
      { id: "C", text: "Pass-through Authentication (PTA)", rationale: "Incorrect. PTA still requires on-premises authentication agents to validate credentials." },
      { id: "D", text: "Seamless Single Sign-On with Kerberos", rationale: "Incorrect. Seamless SSO complements PHS or PTA but does not authenticate users by itself." },
    ],
    correctOptionId: "A",
    explanation: "Password Hash Synchronization authenticates users entirely in the cloud using synchronized password hashes, with no on-premises authentication dependency."
  }),

  choiceQuestion({
    id: "Q2367", domain: "D2", type: "case-study", difficulty: "medium",
    company: "Proseware Ltd",
    scenario: "Case study: Proseware must migrate 50 TB of on-premises NFS file data to Azure Files (NFS protocol) for Linux applications. They have a 1 Gbps internet connection and a 2-week migration window.",
    stem: "Which data transfer solution should you recommend?",
    subtopic: "Configure Azure import/export and data movement",
    referenceTopic: "AzCopy vs Azure Data Box for large-scale file migrations",

    hint: "AzCopy performs high-throughput parallel transfers directly over an existing internet connection without requiring physical hardware. Azure Data Box is the appropriate choice only when transferring very large datasets where network bandwidth or latency makes online transfer impractical.",
    caseStudyId: "CS-PROSEWARE-CLOUD",
    options: [
      { id: "A", text: "Use AzCopy to transfer files from on-premises NFS shares to Azure Files over the internet.", rationale: "Correct. 50 TB over 1 Gbps takes approximately 4-7 days depending on overhead  feasible within 2 weeks." },
      { id: "B", text: "Use Azure Data Box to physically ship the data.", rationale: "Incorrect. Data Box adds shipping lead time and is better for cases where network transfer is not feasible." },
      { id: "C", text: "Use Azure File Sync to continuously sync from on-premises to Azure Files.", rationale: "Incorrect. Azure File Sync targets SMB shares (not NFS) and is for continuous sync, not one-time migration." },
      { id: "D", text: "Use Azure Migrate to lift-and-shift the NFS server VM.", rationale: "Incorrect. Azure Migrate moves virtual machines, not file data to Azure Files." },
    ],
    correctOptionId: "A",
    explanation: "AzCopy can transfer to Azure Files, and 50 TB over 1 Gbps is feasible within 2 weeks, making AzCopy the recommended one-time migration approach."
  }),

  choiceQuestion({
    id: "Q2368", domain: "D3", type: "case-study", difficulty: "medium",
    company: "Proseware Ltd",
    scenario: "Case study: Proseware is deploying a stateless HTTP API as an Azure Container App. The API receives unpredictable traffic bursts. The team wants container replicas to automatically scale based on HTTP request queue depth.",
    stem: "Which Container Apps scaling rule type should you configure?",
    subtopic: "Configure and manage containerized workloads",
    referenceTopic: "Azure Container Apps  HTTP scaling rules via KEDA",

    hint: "Azure Container Apps provides a native HTTP scaling rule that monitors concurrent incoming requests and scales replicas accordingly—purpose-built for web-facing workloads experiencing bursty traffic without requiring custom metric infrastructure.",
    caseStudyId: "CS-PROSEWARE-CLOUD",
    options: [
      { id: "A", text: "HTTP scaling rule based on concurrent HTTP requests.", rationale: "Correct. Azure Container Apps HTTP scaling rules use KEDA to scale based on concurrent requests or queue depth." },
      { id: "B", text: "Custom scaling rule based on CPU utilization.", rationale: "Incorrect. CPU scaling reacts after CPU is already elevated; HTTP queue depth scaling is more responsive." },
      { id: "C", text: "Manual scaling configured through a deployment manifest.", rationale: "Incorrect. Manual scaling requires human intervention, unsuitable for unpredictable traffic." },
      { id: "D", text: "VMSS-based autoscale with a custom Azure Monitor metric.", rationale: "Incorrect. VMSS autoscale applies to Virtual Machine Scale Sets, not Container Apps replicas." },
    ],
    correctOptionId: "A",
    explanation: "Azure Container Apps HTTP scaling rules use KEDA to scale replicas based on concurrent HTTP requests, enabling scale-out during spikes and scale-to-zero during idle periods."
  }),

  choiceQuestion({
    id: "Q2369", domain: "D4", type: "case-study", difficulty: "medium",
    company: "Proseware Ltd",
    scenario: "Case study: Proseware has spoke VNets connected to a hub VNet via peering. The hub contains an Azure Firewall. Spoke VMs currently send internet traffic directly without going through the firewall.",
    stem: "What configuration forces spoke VM internet traffic through the Azure Firewall in the hub?",
    subtopic: "Configure Azure routing",
    referenceTopic: "User-defined routes for hub-and-spoke firewall forced routing",

    hint: "In a hub-spoke topology, VMs in spoke VNets use Azure system routes by default. A User Defined Route with destination 0.0.0.0/0 pointing to the Azure Firewall private IP overrides system routing and forces all internet-bound traffic through the hub firewall.",
    caseStudyId: "CS-PROSEWARE-CLOUD",
    options: [
      { id: "A", text: "Create a UDR on the spoke subnet with 0.0.0.0/0 pointing to the Azure Firewall private IP, and associate it with the spoke subnet.", rationale: "Correct. A UDR with 0.0.0.0/0 overrides Azure default internet routing, forcing all internet-bound traffic through the firewall." },
      { id: "B", text: "Enable 'Allow forwarded traffic' on both peerings.", rationale: "Incorrect. This permits forwarded traffic across peering but does not redirect internet traffic toward the firewall." },
      { id: "C", text: "Configure an NSG on the spoke subnet to deny all outbound internet.", rationale: "Incorrect. Denying traffic blocks internet access but does not redirect it through the firewall." },
      { id: "D", text: "Add the spoke VNet address space as a custom route in the Firewall policy.", rationale: "Incorrect. Firewall policy rules control what the firewall allows; they do not redirect spoke VM traffic toward it." },
    ],
    correctOptionId: "A",
    explanation: "A UDR with 0.0.0.0/0 pointing to the Azure Firewall private IP overrides Azure default internet routing, forcing all spoke internet traffic through the hub firewall."
  }),

  choiceQuestion({
    id: "Q2370", domain: "D5", type: "case-study", difficulty: "medium",
    company: "Proseware Ltd",
    scenario: "Case study: Proseware's operations team suffers alert fatigue from brief CPU spikes. They want an alert that only fires when a VM's CPU exceeds 90% for 15 consecutive minutes.",
    stem: "Which alert configuration prevents alerts from firing on brief CPU spikes?",
    subtopic: "Configure alerts in Azure Monitor",
    referenceTopic: "Azure Monitor metric alerts  aggregation granularity and look-back window",

    hint: "Aggregation granularity determines how long metric data is averaged before the alert condition is evaluated. A 15-minute window requires CPU to remain elevated for the full window before triggering, filtering out transient spikes that a 1-minute window would immediately fire on.",
    caseStudyId: "CS-PROSEWARE-CLOUD",
    options: [
      { id: "A", text: "Set the aggregation granularity to 15 minutes with CPU > 90% threshold.", rationale: "Correct. A 15-minute aggregation window evaluates CPU over 15 minutes, absorbing brief spikes." },
      { id: "B", text: "Set the aggregation granularity to 1 minute with CPU > 90% threshold.", rationale: "Incorrect. A 1-minute window fires on any brief spike above 90%, causing alert noise." },
      { id: "C", text: "Use an action group with a 15-minute cooldown between notifications.", rationale: "Incorrect. Cooldown delays repeat notifications but does not change when the alert condition fires." },
      { id: "D", text: "Set the alert severity to Sev 4.", rationale: "Incorrect. Severity is a classification for triaging, not a mechanism to prevent firing on brief spikes." },
    ],
    correctOptionId: "A",
    explanation: "The 15-minute aggregation granularity evaluates CPU over the full window, absorbing brief spikes. Only sustained elevated CPU throughout the window triggers the alert."
  }),

  // D1 Multiple-choice questions

  choiceQuestion({
    id: "Q2371", domain: "D1", type: "multiple-choice", difficulty: "easy",
    company: "Contoso",
    scenario: "A new IT support engineer must reset passwords for non-administrator users in Microsoft Entra ID without any broader administrative capabilities.",
    stem: "Which built-in Entra ID role should you assign?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Entra ID built-in roles  Helpdesk Administrator",

    hint: "Helpdesk Administrator can reset passwords and invalidate sessions for non-administrator users and certain limited admin roles, making it appropriate for tier-1 support scenarios. Password Administrator is more restricted and cannot manage some admin-role users that Helpdesk Administrator can.",
    options: [
      { id: "A", text: "Helpdesk Administrator", rationale: "Correct. Helpdesk Administrator can reset passwords and update authentication methods for non-privileged users." },
      { id: "B", text: "Password Administrator", rationale: "Incorrect. Password Administrator has narrower capabilities (no MFA method updates) than Helpdesk Administrator." },
      { id: "C", text: "Global Administrator", rationale: "Incorrect. Global Administrator has unrestricted tenant access, violating least privilege." },
      { id: "D", text: "Security Reader", rationale: "Incorrect. Security Reader is read-only for security data and cannot reset passwords." },
    ],
    correctOptionId: "A",
    explanation: "Helpdesk Administrator is purpose-built for IT support: password resets and authentication method updates for non-administrator users."
  }),

  choiceQuestion({
    id: "Q2372", domain: "D1", type: "multiple-choice", difficulty: "easy",
    company: "Fabrikam",
    scenario: "A synchronized Entra ID user must be blocked from signing in immediately without deleting the on-premises AD account.",
    stem: "What is the quickest way to block this user from signing in to Azure?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Block sign-in for a synchronized user in Entra ID",

    hint: "Setting Block sign-in to Yes on an Entra ID user object takes effect within minutes and prevents new authentication attempts immediately. Disabling an on-premises AD account and waiting for sync introduces a delay, making it unsuitable when immediate access revocation is required.",
    options: [
      { id: "A", text: "Set 'Block sign in' to Yes on the Entra ID user object.", rationale: "Correct. This takes effect within minutes without waiting for sync cycles." },
      { id: "B", text: "Disable the on-premises AD account and wait for the sync cycle.", rationale: "Incorrect. Sync cycles take up to 30 minutes to propagate the disabled state." },
      { id: "C", text: "Revoke all active sessions and tokens.", rationale: "Incorrect. Token revocation terminates existing sessions but does not prevent new sign-ins." },
      { id: "D", text: "Delete the Entra Connect sync rule.", rationale: "Incorrect. Modifying sync rules is a major operational change with delayed propagation." },
    ],
    correctOptionId: "A",
    explanation: "Setting 'Block sign in' on the Entra ID user object takes effect almost immediately, preventing new sign-ins without on-premises changes or sync cycles."
  }),

  choiceQuestion({
    id: "Q2373", domain: "D1", type: "multiple-choice", difficulty: "medium",
    company: "Alpine Ski House",
    scenario: "A team wants to validate a Bicep template for syntax errors and preview resource changes before deploying.",
    stem: "Which two Azure CLI commands should you run, in order?",
    subtopic: "Deploy resources by using Azure Bicep templates",
    referenceTopic: "Bicep validation and what-if preview",

    hint: "Bicep files are a domain-specific language that must be transpiled to ARM JSON before Azure deployment commands can process them. Run az bicep build first to compile the .bicep file, then use az deployment group what-if to preview changes without committing them.",
    options: [
      { id: "A", text: "az bicep build followed by az deployment group what-if", rationale: "Correct. 'az bicep build' validates the Bicep file. 'az deployment group what-if' previews resource changes without deploying." },
      { id: "B", text: "az deployment group validate followed by az deployment group create --confirm-with-what-if", rationale: "Incorrect. '--confirm-with-what-if' is interactive; the dedicated what-if command is the explicit approach for preview." },
      { id: "C", text: "az bicep lint followed by az deployment group deploy", rationale: "Incorrect. Deploy executes the deployment rather than previewing it." },
      { id: "D", text: "az group deployment validate followed by az group deployment what-if", rationale: "Incorrect. 'az group deployment' commands are deprecated." },
    ],
    correctOptionId: "A",
    explanation: "The recommended Bicep pre-deployment workflow: (1) 'az bicep build' compiles and validates syntax, then (2) 'az deployment group what-if' previews changes without deploying."
  }),

  choiceQuestion({
    id: "Q2374", domain: "D1", type: "multiple-choice", difficulty: "easy",
    company: "Litware",
    scenario: "Developers need read-only access to all resources in a specific resource group. No custom roles.",
    stem: "Which built-in Azure role should you assign?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Azure RBAC  Reader role",

    hint: "The Reader built-in role grants read access to view all resources within the assigned scope without any permission to create, modify, or delete resources. It represents the minimum viable role when the requirement is read-only visibility at the resource group level.",
    options: [
      { id: "A", text: "Reader", rationale: "Correct. Reader provides read-only access to view all resources without making changes." },
      { id: "B", text: "Contributor", rationale: "Incorrect. Contributor allows creating and managing resources." },
      { id: "C", text: "Monitoring Reader", rationale: "Incorrect. Monitoring Reader is scoped to monitoring data, not all resource types." },
      { id: "D", text: "Security Reader", rationale: "Incorrect. Security Reader is scoped to Defender for Cloud security data." },
    ],
    correctOptionId: "A",
    explanation: "Reader is the standard built-in role for read-only access across all resource types at the assigned scope."
  }),

  // D2 Multiple-choice questions

  choiceQuestion({
    id: "Q2377", domain: "D2", type: "multiple-choice", difficulty: "easy",
    company: "Contoso",
    scenario: "A developer needs read-only access to blobs in a specific container without storage account key access.",
    stem: "Which access control mechanism should you use?",
    subtopic: "Configure storage account access",
    referenceTopic: "Azure RBAC for Blob Storage  Storage Blob Data Reader",

    hint: "Assigning the Storage Blob Data Reader role via Entra ID provides auditable, identity-based access scoped to a specific container—following least-privilege principles. SAS tokens and shared keys both bypass identity governance controls and carry credential management overhead.",
    options: [
      { id: "A", text: "Assign Storage Blob Data Reader scoped to the specific container.", rationale: "Correct. Azure RBAC storage roles can be scoped to individual containers, granting least-privilege keyless access." },
      { id: "B", text: "Share the storage account access key.", rationale: "Incorrect. Access keys grant full storage account access, violating least privilege." },
      { id: "C", text: "Create an account SAS token with read permissions.", rationale: "Incorrect. SAS requires key management; RBAC is recommended for long-term developer access." },
      { id: "D", text: "Enable anonymous blob access on the container.", rationale: "Incorrect. Anonymous access removes authentication entirely." },
    ],
    correctOptionId: "A",
    explanation: "Storage Blob Data Reader scoped to the container provides least-privilege, keyless, Entra ID-authenticated read access."
  }),

  choiceQuestion({
    id: "Q2378", domain: "D2", type: "multiple-choice", difficulty: "easy",
    company: "Fabrikam",
    scenario: "A storage account must allow access from on-premises IP range (10.1.0.0/24) and Azure VMs in a specific VNet, and deny all other public access.",
    stem: "How should you configure the storage account network settings?",
    subtopic: "Configure Azure Storage networking",
    referenceTopic: "Storage account firewall  IP rules and VNet service endpoints",

    hint: "Consider how network boundaries restrict storage access through different mechanisms. Compare direct IP filtering with service-level endpoints for selective network connectivity.",
    options: [
      { id: "A", text: "Set public access to 'Enabled from selected virtual networks and IP addresses', add the IP range and VNet subnet with a service endpoint.", rationale: "Correct. The storage firewall allows both IP ranges (on-premises) and VNet subnets with service endpoints." },
      { id: "B", text: "Disable public access and only add the on-premises IP range.", rationale: "Incorrect. Disabling public access blocks IP-range-based access too." },
      { id: "C", text: "Enable from all networks and use NSGs to filter.", rationale: "Incorrect. NSGs apply to VMs, not storage endpoints. All-networks allows unrestricted public access." },
      { id: "D", text: "Use a private endpoint and disable public access.", rationale: "Incorrect. Private endpoints cover VNet access but not on-premises IP-range-based public access." },
    ],
    correctOptionId: "A",
    explanation: "The storage firewall combines IP-based rules (for on-premises) and VNet service endpoint rules (for Azure VMs) under 'selected virtual networks and IP addresses'."
  }),

  choiceQuestion({
    id: "Q2379", domain: "D2", type: "multiple-choice", difficulty: "medium",
    company: "Adatum",
    scenario: "An application uses a storage account connection string with an access key. A security review requires migrating to managed identity authentication with minimal code changes.",
    stem: "Which SDK authentication credential class should the application use?",
    subtopic: "Configure storage account access",
    referenceTopic: "Azure Storage SDK  DefaultAzureCredential for managed identity",

    hint: "SDK credential classes abstract authentication mechanisms from applications. Identify which credential approach automatically uses Azure managed identity without requiring hardcoded secrets.",
    options: [
      { id: "A", text: "StorageSharedKeyCredential", rationale: "Incorrect. This uses the storage account key, which the team is moving away from." },
      { id: "B", text: "DefaultAzureCredential from Azure.Identity", rationale: "Correct. DefaultAzureCredential automatically uses managed identity when running in Azure, requiring minimal code changes." },
      { id: "C", text: "AzureSasCredential with a pre-generated SAS token", rationale: "Incorrect. SAS still requires key management and does not use managed identity." },
      { id: "D", text: "AnonymousCredential with public container access", rationale: "Incorrect. Anonymous credentials bypass authentication, which is insecure for application data." },
    ],
    correctOptionId: "B",
    explanation: "DefaultAzureCredential automatically selects managed identity when the application runs in Azure, providing seamless keyless authentication with minimal code changes."
  }),

  // D3 Multiple-choice questions

  choiceQuestion({
    id: "Q2380", domain: "D3", type: "multiple-choice", difficulty: "easy",
    company: "Tailwind",
    scenario: "A developer wants to run a single containerized test job in Azure for approximately 1 hour. No inbound network requirements; no cluster management desired.",
    stem: "Which Azure compute service is most appropriate?",
    subtopic: "Configure Azure Container Instances",
    referenceTopic: "ACI  serverless containers for one-time tasks",

    hint: "Azure compute services vary in management overhead and workload duration. Which service minimizes orchestration complexity for short-lived, batch-style container operations?",
    options: [
      { id: "A", text: "Azure Kubernetes Service (AKS)", rationale: "Incorrect. AKS requires provisioning and managing a Kubernetes cluster." },
      { id: "B", text: "Azure Container Instances (ACI)", rationale: "Correct. ACI provides serverless container execution without infrastructure management, ideal for short-duration jobs." },
      { id: "C", text: "Azure Virtual Machines", rationale: "Incorrect. VMs require OS management and are over-engineered for a single container job." },
      { id: "D", text: "Azure Container Apps", rationale: "Incorrect. Container Apps is designed for long-running scalable workloads, not single-use batch jobs." },
    ],
    correctOptionId: "B",
    explanation: "Azure Container Instances is purpose-built for short-lived, serverless container execution without cluster management."
  }),

  choiceQuestion({
    id: "Q2381", domain: "D3", type: "multiple-choice", difficulty: "easy",
    company: "Contoso",
    scenario: "An administrator needs to connect to a Linux VM with no public IP using the Azure portal browser-based SSH terminal. Azure Bastion is deployed in the VNet.",
    stem: "What must the administrator do to connect using Azure Bastion?",
    subtopic: "Configure Azure Bastion",
    referenceTopic: "Azure Bastion  portal-based SSH without public IP",

    hint: "VMSS upgrade policies control the percentage of instances updated simultaneously. Understand how batch sizing impacts availability during rolling deployment operations.",
    options: [
      { id: "A", text: "Assign a public IP to the VM, then use Azure Bastion.", rationale: "Incorrect. Bastion connects to VMs without public IPs." },
      { id: "B", text: "Navigate to the VM, select Connect > Bastion, and enter SSH credentials.", rationale: "Correct. This is the standard portal workflow. Bastion proxies the connection through its public IP." },
      { id: "C", text: "Install the Azure Bastion agent on the VM.", rationale: "Incorrect. Bastion requires no agent on the VM." },
      { id: "D", text: "Open port 22 on the VM NSG to the internet.", rationale: "Incorrect. Bastion connects internally from the BastionSubnet; port 22 need not be open to the internet." },
    ],
    correctOptionId: "B",
    explanation: "Azure Bastion provides browser-based SSH without public IPs or internet-facing NSG rules, via the portal Connect > Bastion workflow."
  }),

  choiceQuestion({
    id: "Q2382", domain: "D3", type: "multiple-choice", difficulty: "medium",
    company: "Northwind",
    scenario: "A VMSS in Uniform orchestration mode needs a new OS image update. No more than 20% of instances should be offline at any time.",
    stem: "Which VMSS upgrade policy should you configure?",
    subtopic: "Configure Azure Virtual Machine scale sets",
    referenceTopic: "VMSS upgrade policies  Rolling with maxBatchInstancePercent",

    hint: "Rolling upgrade policies manage instance availability during maintenance. Consider how batch percentages affect update velocity and service continuity.",
    options: [
      { id: "A", text: "Manual upgrade policy", rationale: "Incorrect. Manual upgrades require per-instance triggering without batch control." },
      { id: "B", text: "Automatic upgrade policy", rationale: "Incorrect. Automatic upgrades may affect many instances simultaneously." },
      { id: "C", text: "Rolling upgrade policy with maxBatchInstancePercent of 20%", rationale: "Correct. Rolling upgrades update instances in configurable batches; 20% ensures limited disruption." },
      { id: "D", text: "Image-based deployment via Azure DevOps without an upgrade policy", rationale: "Incorrect. This does not configure VMSS batch upgrade control." },
    ],
    correctOptionId: "C",
    explanation: "Rolling upgrade policy with maxBatchInstancePercent=20% ensures at most 20% of instances are upgraded at any time, maintaining availability."
  }),

  // D4 Multiple-choice questions

  choiceQuestion({
    id: "Q2383", domain: "D4", type: "multiple-choice", difficulty: "easy",
    company: "Contoso",
    scenario: "Multiple spoke VNets need bidirectional connectivity to a hub VNet hosting shared services.",
    stem: "Which networking feature connects spoke VNets to the hub VNet?",
    subtopic: "Configure virtual network peering",
    referenceTopic: "Hub-and-spoke topology  VNet peering",

    hint: "VNet peering connects virtual networks at the routing layer. Verify both routing tables and NSG rules on connected networks enable bidirectional flow.",
    options: [
      { id: "A", text: "VNet-to-VNet VPN connections", rationale: "Incorrect. VNet VPN adds latency and requires gateways; VNet peering is preferred for intra-Azure connectivity." },
      { id: "B", text: "VNet peering", rationale: "Correct. VNet peering provides low-latency, high-bandwidth Microsoft backbone connectivity." },
      { id: "C", text: "ExpressRoute private peering", rationale: "Incorrect. ExpressRoute connects on-premises to Azure, not Azure VNet to VNet." },
      { id: "D", text: "Azure Service Bus with private endpoints", rationale: "Incorrect. Service Bus is a messaging platform, not a network connectivity feature." },
    ],
    correctOptionId: "B",
    explanation: "VNet peering is the standard hub-and-spoke connectivity mechanism providing low-latency Microsoft backbone connectivity between VNets."
  }),

  choiceQuestion({
    id: "Q2384", domain: "D4", type: "multiple-choice", difficulty: "easy",
    company: "Fabrikam",
    scenario: "A web VM subnet requires inbound HTTP (80) and HTTPS (443) from the internet. All other inbound traffic must be blocked.",
    stem: "Where should you configure the inbound allow rules?",
    subtopic: "Configure network security groups",
    referenceTopic: "NSG placement  subnet vs NIC",

    hint: "NSG flow logs record network traffic patterns requiring persistent storage. Identify the Azure storage configuration that captures and retains these diagnostic logs.",
    options: [
      { id: "A", text: "NSG attached to the subnet hosting the web VMs.", rationale: "Correct. Subnet-level NSG applies rules to all VMs in the subnet centrally." },
      { id: "B", text: "NSG attached to each VM NIC individually.", rationale: "Incorrect. NIC-level NSGs require per-NIC management for shared rules." },
      { id: "C", text: "Azure Load Balancer inbound NAT rules.", rationale: "Incorrect. NAT rules define port-forwarding, not security filtering." },
      { id: "D", text: "Azure Firewall policy in the hub VNet.", rationale: "Incorrect. For subnet-level access, an NSG on the subnet is the direct control." },
    ],
    correctOptionId: "A",
    explanation: "A subnet-level NSG applies HTTP/HTTPS allow rules centrally to all VMs in the subnet, with implicit deny for all other inbound traffic."
  }),

  choiceQuestion({
    id: "Q2385", domain: "D4", type: "multiple-choice", difficulty: "medium",
    company: "Proseware",
    scenario: "Azure DNS manages proseware.com. An on-premises mail server (mail.proseware.com) must receive email for the domain.",
    stem: "Which DNS record type routes email for proseware.com to the on-premises mail server?",
    subtopic: "Configure Azure DNS",
    referenceTopic: "Azure DNS record types  MX records",

    hint: "MX records route incoming email to designated mail servers. Consider how DNS zone delegation enables specific record types for mail delivery.",
    options: [
      { id: "A", text: "A record pointing to the mail server public IP", rationale: "Incorrect. A records map hostnames to IPs; they do not specify mail servers for a domain." },
      { id: "B", text: "MX record pointing to mail.proseware.com", rationale: "Correct. MX records define mail servers responsible for accepting email for a domain." },
      { id: "C", text: "CNAME record aliasing @ to mail.proseware.com", rationale: "Incorrect. CNAME cannot be used at the zone apex and does not route email." },
      { id: "D", text: "TXT record with the mail server IP", rationale: "Incorrect. TXT records are for verification and SPF/DKIM, not mail routing." },
    ],
    correctOptionId: "B",
    explanation: "MX (Mail Exchanger) records specify which mail servers accept email for a domain. An MX record pointing to mail.proseware.com routes inbound email to the on-premises mail server."
  }),

  choiceQuestion({
    id: "Q2386", domain: "D4", type: "multiple-choice", difficulty: "medium",
    company: "Adatum",
    scenario: "A VPN Gateway is configured for site-to-site VPN with BGP. The operations team needs to confirm which BGP routes the gateway is currently receiving from on-premises.",
    stem: "Where in the Azure portal can you view the BGP routes learned by the VPN Gateway?",
    subtopic: "Configure Azure VPN Gateways",
    referenceTopic: "VPN Gateway  BGP peer status and learned routes",

    hint: "BGP manages dynamic routing in hybrid network scenarios. Determine where Azure portal displays BGP peer routes learned by VPN Gateway.",
    options: [
      { id: "A", text: "VPN Gateway > Monitoring > BGP peers", rationale: "Correct. The BGP peers section shows connected peers and routes learned from each peer." },
      { id: "B", text: "Local network gateway effective routes tab", rationale: "Incorrect. The local network gateway defines on-premises endpoint parameters; it does not show runtime BGP tables." },
      { id: "C", text: "VNet effective routes on a subnet", rationale: "Incorrect. Effective routes show combined routing for subnet resources, not gateway BGP learned routes." },
      { id: "D", text: "Azure Network Watcher > Route Table", rationale: "Incorrect. Network Watcher provides per-flow diagnostics; BGP inspection is in the VPN Gateway." },
    ],
    correctOptionId: "A",
    explanation: "The VPN Gateway portal blade includes BGP diagnostics under Monitoring > BGP peers, showing peers and routes learned from each."
  }),

  // D5 Multiple-choice questions

  choiceQuestion({
    id: "Q2387", domain: "D5", type: "multiple-choice", difficulty: "easy",
    company: "Contoso",
    scenario: "Operations wants a KQL query to identify VMs that have not sent a heartbeat in the last 5 minutes.",
    stem: "Which KQL query correctly finds VMs missing heartbeats in the last 5 minutes?",
    subtopic: "Query and analyze logs in Azure Monitor",
    referenceTopic: "KQL  Heartbeat table, ago() operator",

    hint: "KQL queries identify patterns in time-series monitoring data. Structure queries to detect agents missing heartbeat telemetry within specific time windows.",
    options: [
      { id: "A", text: "Heartbeat | where TimeGenerated < ago(5m) | summarize count() by Computer", rationale: "Incorrect. This returns heartbeats older than 5 minutes, not VMs missing recent heartbeats." },
      { id: "B", text: "Heartbeat | summarize LastHeartbeat = max(TimeGenerated) by Computer | where LastHeartbeat < ago(5m)", rationale: "Correct. This finds each VM most recent heartbeat and filters for VMs whose last heartbeat is more than 5 minutes ago." },
      { id: "C", text: "Heartbeat | where TimeGenerated > ago(5m) | summarize count() by Computer", rationale: "Incorrect. This shows VMs that have sent heartbeats recently  the opposite of what is needed." },
      { id: "D", text: "AzureActivity | where OperationName == 'Heartbeat' | where TimeGenerated < ago(5m)", rationale: "Incorrect. VM heartbeats are in the Heartbeat table in Log Analytics, not AzureActivity." },
    ],
    correctOptionId: "B",
    explanation: "The query finds each VM most recent heartbeat timestamp and filters for VMs where that timestamp is more than 5 minutes ago, identifying machines that have gone silent."
  }),

  choiceQuestion({
    id: "Q2390", domain: "D5", type: "multiple-choice", difficulty: "medium",
    company: "Litware",
    scenario: "A Recovery Services vault backs up 50 VMs with a policy retaining daily recovery points for 30 days and weekly for 12 weeks. A compliance audit mandates extending weekly retention to 52 weeks and requires that all policy modifications be logged and auditable for governance tracking.",
    stem: "Where should you modify the retention period?",
    subtopic: "Manage site recovery and backups",
    referenceTopic: "Azure Backup  backup policies and retention",

    hint: "Grandfather-Father-Son (GFS) retention organizes backups across time granularities. Understand how daily, weekly, monthly, and yearly retention tiers combine strategically.",
    options: [
      { id: "A", text: "Recovery Services vault > Backup Policies  edit the policy and update weekly retention to 52 weeks.", rationale: "Correct. Backup retention is set at the policy level; editing the policy propagates the change to all VMs using it." },
      { id: "B", text: "Each VM Backup blade  extend retention per recovery point.", rationale: "Incorrect. Retention is set at policy level, not per individual recovery point." },
      { id: "C", text: "Delete and recreate the backup policy with 52-week retention.", rationale: "Incorrect. Deleting the policy disrupts backups and orphans existing recovery points." },
      { id: "D", text: "Recovery Services vault > Backup Jobs  modify completed job retention.", rationale: "Incorrect. Backup Jobs shows operation history, not retention configuration." },
    ],
    correctOptionId: "A",
    explanation: "Azure Backup retention is configured in the backup policy. Editing the weekly retention to 52 weeks automatically applies to all VMs using that policy."
  }),

  // Multi-select questions

  multiSelectQuestion({
    id: "Q2391",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "Contoso",
    scenario: "Your organization requires strong security for Microsoft Entra administrator accounts holding privileged roles.",
    stem: "Which THREE security controls should be applied to privileged Entra ID administrator accounts? Select all that apply.",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Privileged account security  MFA, PIM, Conditional Access",

    hint: "Privileged administrator protection requires layered security controls. Identify which mechanisms enforce authentication strength, conditional policies, and session governance.",
    options: [
      { id: "A", text: "Require multi-factor authentication (MFA) for every sign-in.", rationale: "Correct. MFA is a baseline security control for all privileged accounts." },
      { id: "B", text: "Use Microsoft Entra PIM to make privileged roles eligible rather than permanently assigned.", rationale: "Correct. PIM ensures just-in-time access with justification and approval, reducing standing privileged access." },
      { id: "C", text: "Assign Global Administrator permanently to all IT staff for convenience.", rationale: "Incorrect. Permanent, broad role assignment violates least privilege principles." },
      { id: "D", text: "Apply a Conditional Access policy requiring a compliant, Entra-joined device for privileged role sign-ins.", rationale: "Correct. Requiring a compliant device adds another assurance layer for privileged account access." },
      { id: "E", text: "Disable password expiration for admin accounts to reduce help desk calls.", rationale: "Incorrect. Disabling expiration without compensating controls weakens account security." },
    ],
    selectCount: 3,
    correctOptionIds: ["A", "B", "D"],
    explanation: "Privileged account security baseline: MFA on every sign-in (A), just-in-time PIM eligible assignments (B), and Conditional Access requiring compliant devices (D)."
  }),

  multiSelectQuestion({
    id: "Q2392",
    domain: "D2",
    type: "multi-select",
    difficulty: "medium",
    company: "Fabrikam",
    scenario: "A storage account holding financial records must use customer-managed keys (CMK), protect against accidental deletion, and be audited for access.",
    stem: "Which THREE configurations directly address all three requirements?",
    subtopic: "Configure Azure Storage security",
    referenceTopic: "Storage security  CMK, soft delete, diagnostic logging",

    hint: "Customer-managed encryption keys (CMK) keep data encryption under organizational control. Select configurations where encryption keys remain outside Azures default management.",
    options: [
      { id: "A", text: "Configure customer-managed keys in Azure Key Vault for storage account encryption.", rationale: "Correct. CMK transfers encryption key management to the customer." },
      { id: "B", text: "Enable blob soft delete with a 30-day retention period.", rationale: "Correct. Soft delete protects against accidental deletion by retaining deleted blobs." },
      { id: "C", text: "Configure geo-redundant storage (GRS) replication.", rationale: "Incorrect. GRS addresses disaster recovery, not CMK encryption or access auditing." },
      { id: "D", text: "Set the storage account minimum TLS version to 1.2.", rationale: "Incorrect. TLS 1.2 is transport security; it does not address CMK or accidental deletion." },
      { id: "E", text: "Enable diagnostic logging to a Log Analytics workspace to audit blob access.", rationale: "Correct. Diagnostic logging captures blob read/write operations for access auditing." },
    ],
    selectCount: 3,
    correctOptionIds: ["A", "B", "E"],
    explanation: "CMK (A) addresses customer-managed encryption, soft delete (B) protects from accidental deletion, and diagnostic logging (E) enables access auditing."
  }),

  multiSelectQuestion({
    id: "Q2393",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Adatum",
    scenario: "Your web application runs on Azure App Service across multiple regions. You need high availability and performance with automatic traffic routing to the nearest or healthiest endpoint.",
    stem: "Which TWO Azure services route user traffic to the nearest or healthiest regional App Service endpoint?",
    subtopic: "Configure Azure App Service",
    referenceTopic: "Azure Traffic Manager and Azure Front Door for global load balancing",

    hint: "Traffic Manager distributes traffic across regional endpoints using various strategies. Review routing methods that optimize based on geography and performance metrics.",
    options: [
      { id: "A", text: "Azure Traffic Manager", rationale: "Correct. Traffic Manager provides DNS-based global load balancing directing users to the nearest or healthiest endpoint." },
      { id: "B", text: "Azure Load Balancer (Standard)", rationale: "Incorrect. Azure Load Balancer operates at Layer 4 within a single region." },
      { id: "C", text: "Azure Front Door", rationale: "Correct. Front Door provides global Layer 7 load balancing with health probes, routing to the fastest healthy backend." },
      { id: "D", text: "Azure Application Gateway", rationale: "Incorrect. Application Gateway is a regional Layer 7 load balancer without cross-region routing." },
      { id: "E", text: "Azure VPN Gateway", rationale: "Incorrect. VPN Gateway provides hybrid connectivity, not application traffic distribution." },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "C"],
    explanation: "Traffic Manager (A) uses DNS-based routing; Azure Front Door (C) uses anycast with Layer 7 routing and health probes. Both route to the nearest or healthiest App Service endpoint."
  }),

  multiSelectQuestion({
    id: "Q2394",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Tailwind",
    scenario: "Azure SQL Database and Azure Key Vault must be accessible only from VMs within the Azure VNet, with no public internet exposure.",
    stem: "Which TWO features achieve private-only access for these PaaS services?",
    subtopic: "Configure service endpoints and private endpoints",
    referenceTopic: "Private endpoints vs service endpoints for PaaS isolation",

    hint: "Private endpoints restrict PaaS service access to private networks exclusively. Identify configurations preventing unauthorized data exfiltration through public endpoints.",
    options: [
      { id: "A", text: "Private endpoints for both Azure SQL Database and Azure Key Vault.", rationale: "Correct. Private endpoints assign a private IP from the VNet, eliminating public endpoint exposure." },
      { id: "B", text: "Service endpoints enabled on the VNet subnet for SQL and Key Vault.", rationale: "Incorrect. Service endpoints optimize routing but traffic still reaches the public endpoint." },
      { id: "C", text: "Disable public network access on Azure SQL Database and Key Vault after configuring private endpoints.", rationale: "Correct. Disabling public access enforces that all access must traverse the private endpoint." },
      { id: "D", text: "NSG rules allowing inbound traffic from the internet to the PaaS service.", rationale: "Incorrect. Allowing internet inbound contradicts the private-only requirement." },
      { id: "E", text: "VNet peering between the application VNet and a hub VNet.", rationale: "Incorrect. VNet peering enables VNet connectivity but does not make PaaS services private." },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "C"],
    explanation: "Private endpoints (A) provide private IP access to PaaS services; disabling public network access (C) enforces private-only connectivity."
  }),

  multiSelectQuestion({
    id: "Q2395",
    domain: "D5",
    type: "multi-select",
    difficulty: "medium",
    company: "Northwind",
    scenario: "The team wants advance notice of planned Azure maintenance events and automatic notification of Azure service health issues affecting their subscriptions.",
    stem: "Which TWO features should you configure?",
    subtopic: "Configure Azure Monitor alerts and service health",
    referenceTopic: "Azure Service Health  planned maintenance and health alerts",

    hint: "Service Health tracks platform-wide incidents; Resource Health monitors individual resources. Distinguish their scopes and when each provides relevant status information.",
    options: [
      { id: "A", text: "Azure Service Health alerts for Planned Maintenance events.", rationale: "Correct. Service Health sends advance notifications of planned maintenance events." },
      { id: "B", text: "Azure Monitor metric alert for CPU percentage across all VMs.", rationale: "Incorrect. CPU metric alerts notify about VM performance, not maintenance or service health events." },
      { id: "C", text: "Azure Service Health alerts for Service Issues and Health Advisories.", rationale: "Correct. Service Health alerts for Service Issues notify about active outages; Health Advisories cover broader upcoming changes." },
      { id: "D", text: "Log Analytics diagnostic settings on all VMs.", rationale: "Incorrect. Log Analytics collects logs; it does not generate alerts for Azure platform maintenance." },
      { id: "E", text: "Azure Cost Management budget alert at 80% of monthly spend.", rationale: "Incorrect. Budget alerts are for cost thresholds, not maintenance or service health notifications." },
    ],
    selectCount: 2,
    correctOptionIds: ["A", "C"],
    explanation: "Azure Service Health provides alerts for Planned Maintenance (A) and Service Issues/Health Advisories (C), covering advance maintenance notices and real-time service disruptions."
  }),

  // Yes/No questions

  yesNoQuestion({
    id: "Q2396",
    domain: "D1",
    type: "yes-no",
    difficulty: "easy",
    company: "Contoso",
    scenario: "You are troubleshooting access issues for the Finance-Readers group, which was granted Reader role on a resource group but members report inability to perform certain expected read operations. Evaluate the following statements about Azure RBAC group membership and permission inheritance to diagnose the issue.",
    stem: "For each statement about Azure RBAC group-based access, select Yes if true or No if false.",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "RBAC inheritance - group membership and scope",

    hint: "RBAC uses role definitions as security principals for access control. Consider how managed identities function and group membership affects authorization scope.",
    statements: [
      { id: "S1", text: "Azure RBAC role assignments made to an Entra ID group are inherited by all members of that group.", answer: "Yes" as const },
      { id: "S2", text: "A user with the Reader role on a resource group can create new resources within that resource group.", answer: "No" as const },
      { id: "S3", text: "Azure RBAC permissions are additive; a user accumulates permissions from multiple group memberships.", answer: "Yes" as const },
    ],
    explanation: "RBAC role assignments to groups are inherited by all members - True. Reader is read-only and cannot create resources - False. Azure RBAC is additive; permissions from multiple groups combine - True."
  }),

  yesNoQuestion({
    id: "Q2397",
    domain: "D3",
    type: "yes-no",
    difficulty: "easy",
    company: "Fabrikam",
    scenario: "You are reviewing Azure App Service Plan tier capabilities for SSL/TLS certificate binding. Evaluate the following statements.",
    stem: "For each statement about App Service Plan SSL/TLS support, select Yes if true or No if false.",
    subtopic: "Configure Azure App Service",
    referenceTopic: "App Service Plan tiers - SSL/TLS certificate requirements",

    hint: "App Service tiers unlock different production workload capabilities. Review SSL/TLS certificate support, custom domains, and scaling availability across tier levels.",
    statements: [
      { id: "S1", text: "Custom SSL/TLS certificate binding is supported on the Free (F1) App Service Plan tier.", answer: "No" as const },
      { id: "S2", text: "Custom SSL/TLS certificate binding requires the Basic (B1) App Service Plan tier or higher.", answer: "Yes" as const },
      { id: "S3", text: "An App Service web app on the Free (F1) tier can be accessed over HTTPS using the default azurewebsites.net domain without a custom certificate.", answer: "Yes" as const },
    ],
    explanation: "Free (F1) does not support custom SSL certificate binding - False. Custom certificate binding requires Basic (B1) or higher - True. All App Service apps get HTTPS on azurewebsites.net regardless of tier - True."
  }),

  yesNoQuestion({
    id: "Q2398",
    domain: "D4",
    type: "yes-no",
    difficulty: "easy",
    company: "Adatum",
    scenario: "VNet-A (10.1.0.0/16) and VNet-B (10.2.0.0/16) are peered. VNet-B and VNet-C (10.3.0.0/16) are also peered, but VNet-A and VNet-C are not directly peered. Evaluate the following statements.",
    stem: "For each statement about VNet peering behaviour, select Yes if true or No if false.",
    subtopic: "Configure virtual network peering",
    referenceTopic: "VNet peering - private IP connectivity and transitivity",

    hint: "VNet peering connects networks at Layer 3 routing. Understand transitive routing limitations, traffic costs, and connectivity behavior within peered topology.",
    statements: [
      { id: "S1", text: "After VNet-A and VNet-B are peered, VMs in both VNets can communicate using private IP addresses.", answer: "Yes" as const },
      { id: "S2", text: "VNet peering is transitive: if VNet-A peers with VNet-B and VNet-B peers with VNet-C, VNet-A can reach VNet-C automatically.", answer: "No" as const },
      { id: "S3", text: "VNet peering uses the Microsoft backbone network rather than the public internet for traffic between peered VNets.", answer: "Yes" as const },
    ],
    explanation: "Peered VNets communicate via private IPs - True. VNet peering is NOT transitive - False. VNet peering uses the Microsoft backbone, not the public internet - True."
  }),

  // Hot-area questions

  choiceQuestion({
    id: "Q2399",
    domain: "D2",
    type: "hot-area",
    difficulty: "medium",
    company: "Contoso",
    scenario: "Contoso stores blob data in a storage account. The team needs blobs accessed within the last 30 days in Hot tier, blobs not accessed for 30-90 days in Cool tier, and blobs not accessed for more than 90 days in Archive tier, all managed automatically. Last access time tracking is enabled on the storage account.",
    stem: "Which Azure Blob Storage feature should you configure to automatically tier blobs based on their last access time?",
    subtopic: "Configure Azure Blob Storage",
    referenceTopic: "Azure Blob lifecycle management - automatic tier transitions with last access time tracking",

    hint: "Blob lifecycle management automates storage tier transitions. Identify which feature moves blobs through access tiers based on age automatically.",
    options: [
      { id: "A", text: "Azure Blob lifecycle management policy with last access time tracking enabled.", rationale: "Correct. Lifecycle management policies with last access time tracking automatically transition blobs to cooler tiers based on daysAfterLastAccessTimeGreaterThan." },
      { id: "B", text: "Azure Storage Object Replication to copy blobs to a Cool tier storage account.", rationale: "Incorrect. Object Replication copies blobs between accounts but does not change the access tier based on activity." },
      { id: "C", text: "Azure Blob immutable storage with time-based retention policies.", rationale: "Incorrect. Immutable storage prevents modification and deletion; it does not perform automatic tier transitions." },
      { id: "D", text: "Azure File lifecycle management rules applied to blob containers.", rationale: "Incorrect. Azure File lifecycle management is for Azure Files shares, not Blob Storage containers." },
    ],
    correctOptionId: "A",
    explanation: "Azure Blob lifecycle management policies with last access time tracking automatically tier blobs based on when they were last read. Enable last access tracking on the storage account and configure daysAfterLastAccessTimeGreaterThan for Cool (30) and Archive (90) transitions."
  }),

  choiceQuestion({
    id: "Q2400",
    domain: "D1",
    type: "hot-area",
    difficulty: "medium",
    company: "Fabrikam",
    scenario: "A Conditional Access policy is configured with: Assignments = All Users, Target app = Exchange Online. Conditions: Locations = All locations EXCEPT the named location Trusted HQ Network. Grant control: Require MFA. An administrator signs in to Exchange Online from the Trusted HQ Network IP address.",
    stem: "Which outcome applies to the administrator signing in from the Trusted HQ Network?",
    subtopic: "Configure Microsoft Entra ID Conditional Access",
    referenceTopic: "Conditional Access - named locations exclusion from policy conditions",

    hint: "Conditional Access policies evaluate sign-in context dynamically. Analyze how assignment conditions, application selection, and risk factors combine in policies.",
    options: [
      { id: "A", text: "The administrator signs in without being challenged for MFA.", rationale: "Correct. The Trusted HQ Network is excluded from the location condition, so the policy does not apply. MFA is not required." },
      { id: "B", text: "The administrator is challenged for MFA before accessing Exchange Online.", rationale: "Incorrect. Because the sign-in originates from the excluded named location, the location condition is not met and the policy does not enforce MFA." },
      { id: "C", text: "The administrator is blocked from signing in.", rationale: "Incorrect. The policy grants access with MFA, and the exclusion means MFA is not applied; the sign-in is not blocked." },
      { id: "D", text: "The policy evaluates but MFA is waived automatically for administrator accounts.", rationale: "Incorrect. MFA is not automatically waived for administrators; the exemption in this scenario comes from the location exclusion, not the administrator role." },
    ],
    correctOptionId: "A",
    explanation: "When a sign-in originates from the Trusted HQ Network named location, which is excluded from the Locations condition, the Conditional Access policy conditions are not met. The policy does not apply and MFA is not required for that sign-in."
  }),

  // Drag-drop questions

  dragDropQuestion({
    id: "Q2401",
    domain: "D1",
    type: "drag-drop",
    difficulty: "medium",
    company: "Contoso",
    scenario: "Your security team needs to understand which Microsoft Entra ID feature to use for each security requirement.",
    stem: "Match each Entra ID feature to its primary security purpose. Arrange the features in the order of the purposes listed.",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Entra ID security features - PIM, Conditional Access, Identity Protection",

    hint: "Azure security features address distinct governance and access concerns. Match each feature—PIM, Conditional Access, IP matching—to its specific security role.",
    availableItems: [
      "Conditional Access",
      "Identity Protection",
      "Privileged Identity Management (PIM)"
    ],
    answerSlots: [
      "Just-in-time privileged role activation with approval and audit",
      "Policy enforcement based on user, location, device, and app conditions",
      "Risk detection and remediation for risky sign-ins and user accounts"
    ],
    correctOrder: [
      "Privileged Identity Management (PIM)",
      "Conditional Access",
      "Identity Protection"
    ],
    explanation: "PIM provides just-in-time privileged role activation; Conditional Access enforces access policies based on conditions; Identity Protection detects and remediates risky sign-ins and compromised accounts."
  }),

  dragDropQuestion({
    id: "Q2402",
    domain: "D3",
    type: "drag-drop",
    difficulty: "medium",
    company: "Tailwind",
    scenario: "An architect is selecting the right Azure compute service for each type of workload.",
    stem: "Match each Azure compute service to its best-fit workload. Arrange the services in the order of the workload types listed.",
    subtopic: "Configure Azure compute services",
    referenceTopic: "Azure compute service selection - Functions, AKS, App Service",

    hint: "Azure compute services optimize for different workload patterns and scaling models. Match each service—Functions, AKS, App Service—to appropriate scenarios.",
    availableItems: [
      "Azure App Service",
      "Azure Functions",
      "Azure Kubernetes Service (AKS)"
    ],
    answerSlots: [
      "Event-driven serverless workloads triggered by HTTP, timer, or queue messages",
      "Complex multi-container microservice orchestration requiring full Kubernetes",
      "Managed PaaS hosting for web applications and REST APIs without container management"
    ],
    correctOrder: [
      "Azure Functions",
      "Azure Kubernetes Service (AKS)",
      "Azure App Service"
    ],
    explanation: "Azure Functions handles event-driven serverless workloads; AKS provides full Kubernetes orchestration for complex microservice architectures; App Service offers managed PaaS hosting for web apps and APIs."
  }),

  dragDropQuestion({
    id: "Q2403",
    domain: "D4",
    type: "drag-drop",
    difficulty: "medium",
    company: "Northwind",
    scenario: "A network engineer needs to apply the correct Azure networking feature for each requirement.",
    stem: "Match each Azure networking feature to its primary function. Arrange the features in the order of the functions listed.",
    subtopic: "Configure Azure networking services",
    referenceTopic: "Azure networking features - DNS Private Zone, NSG, UDR",

    hint: "Network configuration combines DNS resolution, traffic filtering, and routing intelligence. Associate each component—DNS, NSG, UDR—with its specific networking function.",
    availableItems: [
      "Azure DNS Private Zone",
      "Network Security Group (NSG)",
      "User-Defined Route (UDR)"
    ],
    answerSlots: [
      "Private DNS name resolution for resources within a VNet without public internet exposure",
      "Filtering inbound and outbound network traffic to and from Azure resources using security rules",
      "Overriding Azure default routing to direct traffic through a specific next hop such as a firewall"
    ],
    correctOrder: [
      "Azure DNS Private Zone",
      "Network Security Group (NSG)",
      "User-Defined Route (UDR)"
    ],
    explanation: "Azure DNS Private Zone provides VNet-scoped private name resolution; NSG filters traffic with allow/deny rules; UDR overrides Azure system routes to send traffic through a custom next hop such as a firewall."
  }),

  dragDropQuestion({
    id: "Q2404",
    domain: "D5",
    type: "drag-drop",
    difficulty: "medium",
    company: "Litware",
    scenario: "An operations team is designing their monitoring solution using Azure Monitor components.",
    stem: "Match each Azure Monitor component to its primary function. Arrange the components in the order of the functions listed.",
    subtopic: "Configure Azure Monitor",
    referenceTopic: "Azure Monitor components - Metrics, Log Analytics, Workbooks",

    hint: "Azure Monitor provides distinct capabilities for metrics collection, logs analysis, and visualization. Match each component to appropriate monitoring scenarios.",
    availableItems: [
      "Azure Monitor Workbooks",
      "Log Analytics Workspace",
      "Azure Monitor Metrics"
    ],
    answerSlots: [
      "Stores numerical time-series data for near real-time alerting and metric dashboards",
      "Collects and stores log and performance data queryable using KQL",
      "Provides interactive customizable dashboards combining metrics, logs, and visualizations"
    ],
    correctOrder: [
      "Azure Monitor Metrics",
      "Log Analytics Workspace",
      "Azure Monitor Workbooks"
    ],
    explanation: "Azure Monitor Metrics stores numerical time-series data for real-time alerting; Log Analytics Workspace collects and stores logs for KQL queries; Workbooks provide rich interactive monitoring dashboards."
  }),

];

export const finalPrepCaseStudies: CaseStudy[] = [
  {
    id: "CS-WOODGROVE-BANK",
    companyName: "Woodgrove Bank",
    title: "Case Study: Multi-region banking platform governance",
    overview:
      "Woodgrove Bank is a multinational financial institution migrating core banking workloads to Azure. The platform team is implementing enterprise-grade security, compliance, and operational visibility across production subscriptions.",
    currentEnvironment: [
      "Production subscriptions are governed under a Corporate management group hierarchy.",
      "Database administrator teams require privileged access to production Azure SQL databases.",
      "Customer transaction records are stored in Azure Blob Storage with regulatory data retention requirements.",
      "Batch transaction reconciliation workloads run on Virtual Machine Scale Sets.",
      "Core banking applications connect to Azure SQL from dedicated application subnets.",
    ],
    plannedChanges: [
      "Implement just-in-time privileged access management for database administrators.",
      "Enable customer-managed key encryption for all storage accounts holding sensitive records.",
      "Pre-scale compute infrastructure before predictable batch processing windows.",
      "Migrate SQL Database connectivity from public internet to private networking.",
      "Create a unified operational monitoring dashboard for the operations team.",
    ],
    requirements: [
      "DBA team must activate SQL access via PIM with manager approval; no standing access allowed.",
      "Storage accounts must use customer-managed keys stored in a Key Vault protected from accidental key deletion.",
      "The reconciliation VMSS must scale to maximum capacity 15 minutes before market close.",
      "SQL Database must be reachable only from the application subnet via a private IP address.",
      "Operations team must have a centralized metrics dashboard without write access to Azure resources.",
    ],
    questionIds: ["Q2351", "Q2352", "Q2353", "Q2354", "Q2355"],
  },
  {
    id: "CS-PROSEWARE-CLOUD",
    companyName: "Proseware Ltd",
    title: "Case Study: Cloud authentication and infrastructure modernisation",
    overview:
      "Proseware Ltd is a software company modernising its Azure infrastructure. The team is migrating from on-premises AD FS to cloud authentication, moving file data to Azure Files, deploying containerised APIs, improving network security, and reducing monitoring alert fatigue.",
    currentEnvironment: [
      "Authentication is federated via on-premises AD FS infrastructure.",
      "50 TB of NFS file data is stored on on-premises file servers.",
      "A new stateless HTTP API is being deployed as an Azure Container App.",
      "Spoke VNets connect to a hub VNet containing an Azure Firewall, but spoke traffic bypasses the firewall.",
      "VM CPU alerts fire on brief spikes, causing significant alert fatigue.",
    ],
    plannedChanges: [
      "Migrate authentication to Microsoft Entra cloud-based authentication (PHS).",
      "Transfer 50 TB of NFS data to Azure Files using AzCopy within a 2-week window.",
      "Configure HTTP-based autoscaling for the Container App API.",
      "Force all spoke VM internet traffic through the hub Azure Firewall using UDRs.",
      "Reconfigure VM CPU alerts to only fire after 15 consecutive minutes above 90%.",
    ],
    requirements: [
      "Authentication must be cloud-only with no on-premises dependency.",
      "File migration must complete within 2 weeks using the existing 1 Gbps internet connection.",
      "Container App must scale automatically based on HTTP request load.",
      "Spoke internet traffic must traverse the hub Azure Firewall for inspection.",
      "VM CPU alerts must not fire on brief spikes shorter than 15 minutes.",
    ],
    questionIds: ["Q2366", "Q2367", "Q2368", "Q2369", "Q2370"],
  },
];


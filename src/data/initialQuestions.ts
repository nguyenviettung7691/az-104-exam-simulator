import { additionalCaseStudies, additionalQuestions } from "./additionalQuestions.ts";
import {
  april2026ExpansionCaseStudies,
  april2026ExpansionQuestions,
} from "./april2026ExpansionQuestions.ts";
import { finalPrepCaseStudies, finalPrepQuestions } from "./finalPrepQuestions.ts";
import { mayExpansionQuestions } from "./mayExpansionQuestions.ts";
import { rebalanceChoiceOptionIds } from "./rebalanceChoiceOptionIds.ts";
import type {
  CaseStudy,
  ChoiceQuestion,
  DragDropQuestion,
  MultiSelectQuestion,
  Question,
  QuestionBank,
  QuestionOption,
  YesNoQuestion,
} from "../types/exam";

const BANK_VERSION = "2026.04.17";
const BANK_UPDATED_AT = "2026-05-09T18:00:00.000Z";

const option = (id: string, text: string, rationale: string): QuestionOption => ({
  id,
  text,
  rationale,
});

const choiceQuestion = (question: Omit<ChoiceQuestion, "active">): ChoiceQuestion => ({
  active: true,
  ...rebalanceChoiceOptionIds(question),
});

const multiSelectQuestion = (
  question: Omit<MultiSelectQuestion, "active">,
): MultiSelectQuestion => ({
  active: true,
  ...question,
});

const yesNoQuestion = (question: Omit<YesNoQuestion, "active">): YesNoQuestion => ({
  active: true,
  ...question,
});

const dragDropQuestion = (
  question: Omit<DragDropQuestion, "active">,
): DragDropQuestion => ({
  active: true,
  ...question,
});

export const initialCaseStudies: CaseStudy[] = [
  {
    id: "CS-CONTOSO-RETAIL",
    companyName: "Contoso Retail Group",
    title: "Case Study: Hub-and-spoke landing zone refresh",
    overview:
      "Contoso Retail Group runs a centralized Azure landing zone for store systems, reporting, and operations. The platform team is standardizing governance, resilience, and private connectivity across production subscriptions.",
    currentEnvironment: [
      "Production and nonproduction subscriptions are organized under a corporate management group hierarchy.",
      "A hub virtual network in East US is peered to separate spoke virtual networks for web, data, and operations workloads.",
      "Retail transaction exports are stored in a general-purpose v2 storage account.",
      "The public web tier runs on a two-instance virtual machine scale set behind a Standard Load Balancer.",
      "Monitoring data is centralized in a single Log Analytics workspace.",
    ],
    plannedChanges: [
      "Deploy the same retail web platform into Central US.",
      "Make transaction exports readable from a secondary region during drills.",
      "Use private connectivity for platform as a service dependencies.",
      "Delegate policy exception management without granting broad administrator access.",
      "Improve recovery readiness for Azure virtual machines.",
    ],
    requirements: [
      "The platform team must manage Azure Policy exemptions without being able to assign RBAC roles.",
      "Transaction export data must remain readable from a secondary region if East US is unavailable.",
      "The web tier must scale automatically with minimal manual administration.",
      "Private endpoint name resolution must work from every spoke virtual network.",
      "The production virtual machines must support regional failover.",
    ],
    questionIds: ["Q2091", "Q2092", "Q2093", "Q2094", "Q2095"],
  },
  {
    id: "CS-FABRIKAM-HEALTH",
    companyName: "Fabrikam Health Services",
    title: "Case Study: Hybrid operations and patient platform modernization",
    overview:
      "Fabrikam Health Services is modernizing a hybrid clinical platform in Azure. The company needs controlled guest access, SMB access to Azure Files, containerized APIs, private application connectivity, and stronger observability.",
    currentEnvironment: [
      "Clinical identities are synchronized from an on-premises Active Directory Domain Services forest to Microsoft Entra ID.",
      "Departmental file shares currently run on Windows servers in the datacenter.",
      "A new patient intake API is being packaged as a containerized HTTP workload.",
      "The patient portal connects to managed Azure platform services from a dedicated application subnet.",
      "Operations teams want centralized monitoring and alert-driven response automation.",
    ],
    plannedChanges: [
      "Invite external support engineers as guest users and place them into support groups.",
      "Move departmental shares into Azure Files while preserving identity-based SMB access.",
      "Run the intake API on a managed container platform that supports revisions and scale to zero.",
      "Keep data services off the public internet by using private connectivity.",
      "Use one logging platform for alerting and operational analysis.",
    ],
    requirements: [
      "Support leads must be able to manage guest users and support groups but must not manage Azure subscriptions.",
      "Windows users must authenticate to Azure Files by using existing AD DS credentials.",
      "The intake API must scale down when idle and support HTTP ingress.",
      "Data services must be reachable from the application subnet over private IP addresses only.",
      "Operations teams must be able to query logs and build alert-driven automation from a central workspace.",
    ],
    questionIds: ["Q2096", "Q2097", "Q2098", "Q2099", "Q2100"],
  },
  ...additionalCaseStudies,
  ...finalPrepCaseStudies,
  ...april2026ExpansionCaseStudies,
];

export const initialQuestions: Question[] = [
  choiceQuestion({
    id: "Q2001",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Manufacturing",
    scenario:
      "Your Microsoft Entra tenant contains a user named User1. User1 must be able to create and manage groups, but must not receive broader directory administration rights.",
    stem: "Which role should you assign to User1?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Microsoft Entra built-in roles",
    options: [
      option("A", "User Administrator", "This role can manage users and groups, which is broader than the stated requirement."),
      option("B", "Groups Administrator", "This role can create and manage groups without adding unrelated tenant-wide permissions."),
      option("C", "Security Administrator", "This role is intended for security posture and policy tasks, not day-to-day group administration."),
      option("D", "Global Administrator", "This role grants full directory control and violates least privilege."),
    ],
    correctOptionId: "B",
    explanation:
      "Groups Administrator is the least-privileged built-in role that covers creating and managing Microsoft Entra groups.",
  }),
  choiceQuestion({
    id: "Q2002",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Fabrikam Advisory",
    scenario:
      "You are piloting self-service password reset (SSPR). Only members of the Finance-Pilot security group should be able to use SSPR during the first phase.",
    stem: "Which SSPR configuration should you choose?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Configure self-service password reset",
    options: [
      option("A", "Enable SSPR for all users", "This exposes the feature to every user instead of only the pilot population."),
      option("B", "Enable SSPR for selected groups", "This lets you target the pilot group and expand later if the rollout is successful."),
      option("C", "Enable SSPR for guest users only", "Guest-only scope does not meet the requirement for internal finance employees."),
      option("D", "Disable SSPR and use Conditional Access", "Conditional Access does not enable password reset workflows."),
    ],
    correctOptionId: "B",
    explanation:
      "SSPR supports targeted rollout to selected groups, which is the standard way to pilot the feature before enabling it tenant-wide.",
  }),
  choiceQuestion({
    id: "Q2003",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "External auditors must access Azure resources by using their existing business email accounts. You want to avoid creating separate cloud-only accounts for them.",
    stem: "Which identity object should you use for the auditors?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Manage external users",
    options: [
      option("A", "Guest user accounts", "B2B guest users can be invited by email and authenticated with their existing identity provider."),
      option("B", "Managed identities", "Managed identities are for workloads, not people signing in interactively."),
      option("C", "Service principals", "Service principals represent applications, not external auditors."),
      option("D", "Cloud-only member users", "This would create separate accounts and does not preserve the auditors' existing identities."),
    ],
    correctOptionId: "A",
    explanation:
      "Guest users are the correct way to provide B2B access while allowing external auditors to sign in with existing identities.",
  }),
  choiceQuestion({
    id: "Q2004",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Litware Retail",
    scenario:
      "An operations team must start, stop, and redeploy virtual machines in the RG-App resource group. They must not manage RBAC assignments or modify unrelated resources in the subscription.",
    stem: "Which built-in Azure role should you assign at RG-App?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Manage built-in Azure roles",
    options: [
      option("A", "Reader", "Reader cannot start or stop virtual machines."),
      option("B", "User Access Administrator", "This role manages access assignments rather than virtual machine operations."),
      option("C", "Virtual Machine Contributor", "This role is scoped to virtual machine management tasks without granting user access administration rights."),
      option("D", "Contributor", "Contributor can manage most resources in the resource group, which is broader than the requirement."),
    ],
    correctOptionId: "C",
    explanation:
      "Virtual Machine Contributor grants the required VM management permissions without the broad resource control of Contributor.",
  }),
  choiceQuestion({
    id: "Q2005",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Tailwind Traders",
    scenario:
      "An operations engineer is onboarded with Reader at the subscription scope and Contributor on RG-Dev only. The engineer must deploy, update, and delete test resources in RG-Dev during a two-week validation window, but must not gain permission to manage RBAC, and must not be able to change workloads in RG-Prod or RG-Shared. There are no deny assignments or custom roles.",
    stem: "What access does the engineer actually have in RG-Dev and outside it?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Interpret access assignments",
    options: [
      option("A", "The engineer can create and manage resources only in RG-Dev", "Contributor at the resource-group scope allows management in that group, while subscription-level Reader remains read-only elsewhere."),
      option("B", "The engineer can create resources in every resource group in the subscription", "Reader at the subscription scope does not grant write access outside RG-Dev."),
      option("C", "The engineer can only view resources in RG-Dev", "Contributor overrides the read-only assignment within RG-Dev for management operations."),
      option("D", "The engineer can assign roles in RG-Dev", "Contributor does not include RBAC role assignment rights."),
    ],
    correctOptionId: "C",
    explanation: "Effective access is additive and scope-bound: Contributor at RG-Dev allows write operations only inside that resource group, while subscription-level Reader still applies outside RG-Dev. Neither assignment grants RBAC administration rights (User Access Administrator). Role combinations follow the principle of highest-privilege-at-any-scope.",
  }),
  choiceQuestion({
    id: "Q2006",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Alpine Ski House",
    scenario:
      "The platform team deploys resources through several pipelines into a landing zone that must always carry a CostCenter tag. New deployments should continue even when the tag is missing, but the governance rule also needs to backfill existing resources that were created before the standard was introduced.",
    stem: "Which Azure governance feature should you use to satisfy both requirements without blocking deployment?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Implement and manage Azure Policy",
    options: [
      option("A", "Azure Policy with the Modify effect", "Modify can add or fix tag values during deployment, and remediation can bring existing resources into compliance."),
      option("B", "Resource locks", "Locks prevent changes or deletion, but they do not add metadata to resources."),
      option("C", "Azure budgets", "Budgets track spend and alerts, but they do not alter resource properties."),
      option("D", "Management groups", "Management groups provide hierarchy, but they do not directly enforce or add tags."),
    ],
    correctOptionId: "A",
    explanation:
      "The Modify effect in Azure Policy can add or correct tag values as resources are deployed, and remediation can bring older resources into compliance later.",
  }),
  choiceQuestion({
    id: "Q2007",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Woodgrove Bank",
    scenario:
      "A production resource group contains customer-facing workloads and is entering a change freeze before quarter-end reporting. The operations team must prevent accidental deletion of the resource group itself, but administrators still need to scale, patch, and update resources inside the group without opening a change window for every routine edit.",
    stem: "Which lock should you apply to the resource group to meet both requirements?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Configure resource locks",
    options: [
      option("A", "A ReadOnly lock", "ReadOnly would also block routine changes such as scaling and patching."),
      option("B", "A CanNotDelete lock", "CanNotDelete blocks accidental deletion while still allowing legitimate updates inside the resource group."),
      option("C", "An Audit policy", "Audit records noncompliance but does not prevent deletion."),
      option("D", "A budget alert", "Budgets are for cost management, not resource protection."),
    ],
    correctOptionId: "B",
    explanation: "CanNotDelete lock is the appropriate governance control for this scenario. It blocks deletion of the resource group itself (which is the accidental deletion risk) but still permits all write operations (scaling, patching, updates) inside the group. ReadOnly would block writes and violate the operational requirement.",
  }),
  choiceQuestion({
    id: "Q2008",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Coho Winery",
    scenario:
      "The finance division has eight Azure subscriptions spread across three regions. Security and compliance teams must apply the same policy assignments and inherited RBAC access once at a parent scope while each subscription still keeps its own workload-specific resource groups and local deployment pipelines without being flattened into a single structure.",
    stem: "At which Azure scope should you organize the finance subscriptions so governance flows down without changing the workload layout?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Configure management groups",
    options: [
      option("A", "A management group", "Management groups let you apply governance and role assignments above the subscription level."),
      option("B", "A resource group", "Resource groups exist inside a single subscription and cannot contain other subscriptions."),
      option("C", "A virtual network", "Virtual networks are networking resources, not governance containers."),
      option("D", "A budget scope", "Budgets do not provide inheritance for policy or RBAC."),
    ],
    correctOptionId: "A",
    explanation:
      "Management groups provide the required hierarchy when the same governance settings must flow to multiple subscriptions without flattening workload boundaries.",
  }),
  choiceQuestion({
    id: "Q2009",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Wingtip Toys",
    scenario:
      "A development subscription needs an alert when monthly spend reaches 80 percent of forecast so the team can review usage before month end. The alert must be informational only, should not pause deployments, and must work without introducing any governance control that could affect the application's release pipeline.",
    stem: "Which feature should you configure?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Manage costs by using alerts and budgets",
    options: [
      option("A", "An Azure Service Health alert", "Service Health tracks Microsoft service events, not subscription spending."),
      option("B", "A ReadOnly lock", "Locks do not provide spending notifications and would disrupt deployments."),
      option("C", "A management group", "Management groups are organizational, not spend-threshold alerting tools."),
      option("D", "A budget with an alert threshold", "Budgets are designed to monitor spend and trigger alerts at defined thresholds."),
    ],
    correctOptionId: "D",
    explanation:
      "Budgets can trigger notifications at custom cost thresholds without enforcing a deployment stop or changing deployment behavior.",
  }),
  choiceQuestion({
    id: "Q2010",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Proseware",
    scenario:
      "Leadership wants a native Azure service that can surface underutilized virtual machines and disks, highlight cost-saving opportunities, and prioritize recommendations the operations team can act on before the next billing cycle ends. The team has a small staff, cannot add a third-party optimization platform, must keep the workflow lightweight, and wants guidance that improves cost without creating extra operational overhead.",
    stem: "Which Azure service should you review first to balance cost reduction with low operational overhead?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Manage costs by using Azure Advisor recommendations",
    options: [
      option("A", "Azure Advisor", "Advisor provides cost, reliability, security, operational excellence, and performance recommendations including rightsizing guidance."),
      option("B", "Activity Log", "The Activity Log records control-plane actions but does not recommend cost savings."),
      option("C", "Azure Policy", "Policy evaluates compliance and can enforce rules, but it does not surface rightsizing recommendations."),
      option("D", "Azure Backup reports", "Backup reports show protection posture rather than cost optimization guidance."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Advisor is the built-in service that surfaces rightsizing and cost optimization recommendations for Azure resources, including underutilized compute and storage.",
  }),
  choiceQuestion({
    id: "Q2011",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "A. Datum Corporation",
    scenario:
      "The identity team adds new hires to the Sales-Licensed group during onboarding and wants each member to receive Microsoft Entra ID P1 automatically. They must keep the licensing model maintainable as employees join and leave the group throughout the month without assigning licenses to each user one by one.",
    stem: "Which licensing approach should you use to meet this requirement?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Manage licenses in Microsoft Entra ID",
    options: [
      option("A", "Group-based licensing", "Group-based licensing automatically assigns licenses to current and future group members."),
      option("B", "Individual direct assignments", "Direct assignments require manual work for every new user."),
      option("C", "Administrative units", "Administrative units scope administration but do not assign licenses."),
      option("D", "Access reviews", "Access reviews govern membership recertification, not licensing."),
    ],
    correctOptionId: "A",
    explanation:
      "Group-based licensing is the efficient, repeatable method when every member of a group must receive the same license set and the assignment should follow group membership automatically.",
  }),
  choiceQuestion({
    id: "Q2012",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Graphic Design Institute",
    scenario:
      "The security team must stop anyone in a subscription from creating new public IP addresses. Existing public IP resources can remain in place for now, but the policy must block any new deployment attempts while leaving the current workloads untouched and without requiring manual cleanup.",
    stem: "Which Azure feature should you configure to enforce that requirement?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Implement and manage Azure Policy",
    options: [
      option("A", "Azure Policy with the Deny effect", "Deny blocks noncompliant resource creation requests at deployment time."),
      option("B", "A CanNotDelete lock", "A deletion lock does not stop new public IP resources from being created."),
      option("C", "Azure Advisor", "Advisor can recommend changes but cannot block deployments."),
      option("D", "A budget alert", "Budgets track spending and do not enforce resource-type restrictions."),
    ],
    correctOptionId: "C",
    explanation:
      "Azure Policy with a Deny effect is the correct control when new public IP deployments must be prevented while leaving already deployed resources alone.",
  }),
  multiSelectQuestion({
    id: "Q2013",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "Fourth Coffee",
    scenario:
      "Contractors in the Storage-Ops security group must manage only the storage accounts in the RG-Finance resource group. The access model must stay narrow enough to avoid subscription-wide permissions, and the team wants to avoid managing individual user assignments one by one while still keeping the role assignment easy to maintain.",
    stem: "Which two actions should you take to implement that access model? Each correct answer presents part of the solution.",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Assign roles at different scopes",
    options: [
      option("A", "Assign the Storage Account Contributor role to the Storage-Ops group at the RG-Finance scope", "This grants the needed storage management permissions only within the required resource group."),
      option("B", "Assign the Owner role to the Storage-Ops group at the subscription scope", "This is far broader than necessary and violates least privilege."),
      option("C", "Create or use a security group for the contractors", "Using a group simplifies RBAC management and aligns with the scenario."),
      option("D", "Assign the Reader role at the tenant root group", "Reader at the tenant root does not provide storage management permissions."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "C"],
    explanation:
      "The correct design is to manage access through a group and assign the minimum required role at the narrowest practical scope, which here is the RG-Finance resource group.",
  }),
  multiSelectQuestion({
    id: "Q2014",
    domain: "D1",
    type: "multi-select",
    difficulty: "hard",
    company: "Lucerne Publishing",
    scenario:
      "Across all landing zone subscriptions, missing ownership tags must be added automatically while any attempt to deploy a public IP resource must be blocked. The governance design needs to stamp metadata on compliant resources and still prevent a risky resource type from being deployed without creating a separate manual tagging process.",
    stem: "Which two Azure Policy effects should you use to satisfy both outcomes while preserving deployment enforcement? Each correct answer presents part of the solution.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Implement and manage Azure Policy",
    options: [
      option("A", "Audit", "Audit reports noncompliance but does not block or correct the deployment."),
      option("B", "Deny", "Deny can block deployment of disallowed resource types such as public IP addresses."),
      option("C", "Modify", "Modify can add or adjust required tags and can be paired with remediation for existing resources."),
      option("D", "Disabled", "Disabled turns off enforcement and does not solve either requirement."),
    ],
    selectCount: 2,
    correctOptionIds: ["B", "C"],
    explanation:
      "Deny and Modify are complementary: Deny blocks deployment of disallowed resource types (public IPs), while Modify adds or corrects tags during deployment. Using both effects together satisfies the dual requirement of enforcement (Deny) and automated tagging (Modify) without requiring separate manual processes.",
  }),
  multiSelectQuestion({
    id: "Q2015",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "Consolidated Messenger",
    scenario:
      "Finance wants a budget alert when monthly spend reaches 80 percent of budget, while a separate monthly review should surface cost-saving recommendations the team can act on before the next billing cycle. The solution must alert and advise, but it should not block deployments or force a governance change.",
    stem: "Which two Azure features should you use to meet both needs? Each correct answer presents part of the solution.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Manage costs by using alerts, budgets, and Azure Advisor recommendations",
    options: [
      option("A", "Azure budgets", "Budgets provide threshold-based cost notifications."),
      option("B", "Resource locks", "Resource locks do not provide cost controls or notifications."),
      option("C", "Azure Advisor", "Advisor provides cost-saving recommendations such as rightsizing guidance."),
      option("D", "Activity Log alerts", "Activity Log alerts are event-driven and not designed for budget thresholds or cost recommendations."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "C"],
    explanation:
      "Budgets cover spend threshold notifications, while Azure Advisor is the native recommendation engine for cost optimization guidance. Together they satisfy alerting and monthly review without affecting deployments.",
  }),
  yesNoQuestion({
    id: "Q2016",
    domain: "D1",
    type: "yes-no",
    difficulty: "easy",
    company: "City Power and Light",
    scenario: "You are reviewing proposed RBAC and governance statements for an Azure environment before a production rollout, and the team must avoid giving away overly broad permissions.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Interpret access assignments",
    statements: [
      { id: "S1", text: "A role assignment created at the subscription scope is inherited by all resource groups in that subscription.", answer: "Yes" },
      { id: "S2", text: "The Reader role lets a user delete a tag from a resource.", answer: "No" },
    ],
    explanation:
      "RBAC assignments inherit from parent scopes. The Reader role does not allow write operations such as editing or removing tags.",
  }),
  yesNoQuestion({
    id: "Q2017",
    domain: "D1",
    type: "yes-no",
    difficulty: "medium",
    company: "Blue Yonder Airlines",
    scenario: "You are validating identity administration statements before a tenant rollout, and the rollout plan must support guest collaboration, scoped password reset, and group-based licensing without forcing a tenant-wide change.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Manage external users and SSPR",
    statements: [
      { id: "S1", text: "Guest users can be added to Microsoft Entra groups.", answer: "Yes" },
      { id: "S2", text: "Self-service password reset can be enabled for selected groups instead of the entire tenant.", answer: "Yes" },
      { id: "S3", text: "Group-based licensing applies only to users who are already members at the time the license is assigned.", answer: "No" },
    ],
    explanation:
      "Guest users can participate in group membership, SSPR can be rolled out to selected groups, and group-based licensing also applies to future group members.",
  }),
  yesNoQuestion({
    id: "Q2018",
    domain: "D1",
    type: "yes-no",
    difficulty: "medium",
    company: "Nod Publishers",
    scenario:
      "You are reviewing governance controls for a new landing zone that must protect production subscriptions, apply required tags to new resources, and provide budget notifications without blocking routine operations or forcing a separate change window for every update.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Implement and manage Azure Policy and resource locks",
    statements: [
      { id: "S1", text: "A ReadOnly lock prevents administrators from changing tags on a locked resource.", answer: "Yes" },
      { id: "S2", text: "Azure Policy can append or modify tags during deployment.", answer: "Yes" },
      { id: "S3", text: "A budget can automatically shut down virtual machines without any other automation component.", answer: "No" },
    ],
    explanation:
      "ReadOnly locks block write operations, Azure Policy can stamp tags, and budgets alone only trigger notifications rather than performing shutdown actions.",
  }),
  choiceQuestion({
    id: "Q2019",
    domain: "D1",
    type: "hot-area",
    difficulty: "easy",
    company: "Contoso Finance",
    scenario:
      "You are assigning a policy that must affect every subscription used by the finance division, but must not affect subscriptions owned by other divisions.",
    stem: "In the Azure portal hierarchy, which scope should you select?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Configure management groups",
    options: [
      option("A", "The Finance management group", "A dedicated management group is the narrowest scope that can govern all finance subscriptions together."),
      option("B", "One finance subscription", "A single subscription would not apply the policy to the other finance subscriptions."),
      option("C", "A finance resource group", "A resource group is too low in the hierarchy and cannot contain subscriptions."),
      option("D", "The tenant root group", "Tenant root would affect subscriptions outside the finance division."),
    ],
    correctOptionId: "A",
    explanation:
      "The finance management group is the correct scope because it captures all finance subscriptions without extending governance to unrelated divisions.",
  }),
  dragDropQuestion({
    id: "Q2020",
    domain: "D1",
    type: "drag-drop",
    difficulty: "hard",
    company: "Trey Research",
    scenario:
      "A Modify policy for CostCenter tagging is already defined for a production landing zone. The policy must update existing resources that predate the assignment, while keeping compliant resources untouched and avoiding a rebuild of the environment.",
    stem: "Arrange the actions in the correct order so the policy can be applied and then remediated without rebuilding the environment or disrupting compliant resources.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Implement and manage Azure Policy",
    availableItems: [
      "Assign the policy",
      "Create a remediation task",
      "Create the policy definition",
    ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: ["Create the policy definition", "Assign the policy", "Create a remediation task"],
    explanation:
      "The policy must exist before it can be assigned, and a remediation task is what applies the change to existing resources.",
  }),
  dragDropQuestion({
    id: "Q2021",
    domain: "D1",
    type: "drag-drop",
    difficulty: "easy",
    company: "Humongous Insurance",
    scenario:
      "A set of operators needs virtual machine management access through group-based RBAC, and the team must keep the deployment repeatable for future operators without reassigning the role one user at a time.",
    stem: "Arrange the actions in the correct order.",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Assign roles at different scopes",
    availableItems: [
      "Assign the role at the resource group scope",
      "Add the operators to the group",
      "Create the security group",
    ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: ["Create the security group", "Add the operators to the group", "Assign the role at the resource group scope"],
    explanation:
      "Create the group first, place users into it, and then assign the role at the scope that needs to be controlled.",
  }),
  choiceQuestion({
    id: "Q2022",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Fabrikam Retail",
    scenario: "A container stores rarely accessed archived product catalogs that must remain online for compliance audit purposes. The storage solution must incur the lowest possible monthly storage cost while meeting the 24-hour retrieval SLA for audit requests.",
    stem: "Which blob access tier should you use?",
    subtopic: "Configure Azure Files and Azure Blob Storage",
    referenceTopic: "Configure storage tiers",
    options: [
      option("A", "Hot", "Hot is optimized for frequent access and usually costs more to store."),
      option("B", "Cool", "Cool is optimized for infrequent access while keeping blobs available online."),
      option("C", "Archive", "Archive is offline and would not satisfy the requirement to keep data online."),
      option("D", "Premium", "Premium is for performance-sensitive workloads rather than low-cost infrequent access."),
    ],
    correctOptionId: "B",
    explanation:
      "The Cool tier is the lowest-cost online tier for infrequently accessed blob data.",
  }),
  choiceQuestion({
    id: "Q2023",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso Logistics",
    scenario:
      "A storage account must replicate data to a paired region and allow read access to the replica during disaster recovery testing, while keeping the primary workload online and avoiding a separate reporting copy.",
    stem: "Which redundancy option should you choose to satisfy that requirement?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Configure Azure Storage redundancy",
    options: [
      option("A", "GRS", "GRS replicates to a paired region but does not provide read access to the secondary endpoint."),
      option("B", "RA-GRS", "RA-GRS adds read access to the replicated secondary region endpoint."),
      option("C", "ZRS", "ZRS protects within the primary region only and does not replicate to a second region."),
      option("D", "LRS", "LRS keeps copies in a single datacenter or region only."),
    ],
    correctOptionId: "B",
    explanation:
      "Read-access geo-redundant storage is specifically designed for regional replication plus read access to the secondary endpoint without changing how the primary endpoint is used.",
  }),
  choiceQuestion({
    id: "Q2024",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Northwind Traders",
    scenario:
      "Subnet-App must access a storage account over the public endpoint, but traffic from all other networks must be blocked. You do not want to use private endpoints.",
    stem: "Which networking feature should you enable on Subnet-App?",
    subtopic: "Configure access to storage",
    referenceTopic: "Configure Azure Storage firewalls and virtual networks",
    options: [
      option("A", "A Microsoft.Storage service endpoint", "Service endpoints let the subnet reach the storage account over the Azure backbone while still using the public endpoint."),
      option("B", "A private endpoint", "Private endpoints use a private IP and are unnecessary when the public endpoint must remain in use."),
      option("C", "Azure Front Door", "Front Door is a global application delivery service, not a subnet-to-storage access control feature."),
      option("D", "A NAT gateway", "NAT gateway controls outbound internet translation, not storage firewall integration."),
    ],
    correctOptionId: "C",
    explanation:
      "Service endpoints are the correct subnet-side feature when the storage account should still be reached through its public endpoint but limited to selected virtual networks.",
  }),
  choiceQuestion({
    id: "Q2025",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Adventure Works",
    scenario:
      "An application uses a SAS token to upload blobs, and the operations team must be able to revoke that access without rotating the storage account keys or disrupting other workloads that share the same account.",
    stem: "What should you base the SAS token on to make revocation practical?",
    subtopic: "Configure access to storage",
    referenceTopic: "Configure stored access policies",
    options: [
      option("A", "A stored access policy", "Stored access policies let you change or remove the policy and invalidate dependent SAS tokens."),
      option("B", "An account key rotation policy", "Key rotation is broader and affects every workload using that key."),
      option("C", "A management group", "Management groups do not participate in SAS token revocation."),
      option("D", "A lifecycle management rule", "Lifecycle rules manage blob data behavior, not authorization tokens."),
    ],
    correctOptionId: "A",
    explanation:
      "A stored access policy gives you a server-side control point for SAS lifetime and revocation without rotating account keys or affecting unrelated consumers of the account.",
  }),
  choiceQuestion({
    id: "Q2026",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Blue Yonder Airlines",
    scenario:
      "You must script repeated uploads of 20 TB of file data from a Windows server to Azure Blob Storage, and the transfer process must be resumable, high-throughput, and suitable for unattended execution while minimizing manual cleanup after a network interruption.",
    stem: "Which tool should you use to meet those requirements?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Manage data by using Azure Storage Explorer and AzCopy",
    options: [
      option("A", "Azure Storage Explorer", "Storage Explorer is useful interactively, but AzCopy is the better fit for large scripted transfers."),
      option("B", "AzCopy", "AzCopy is built for high-throughput scripted data movement into Azure Storage."),
      option("C", "The Azure portal upload experience", "Portal uploads are not designed for repeated high-volume scripted transfers."),
      option("D", "Azure Advisor", "Advisor does not move data."),
    ],
    correctOptionId: "B",
    explanation:
      "AzCopy is the preferred tool for large, automated Azure Storage data transfer jobs because it supports high throughput and resumable transfers.",
  }),
  choiceQuestion({
    id: "Q2027",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso Legal",
    scenario:
      "Users on Windows servers joined to on-premises AD DS must access an Azure file share by using their existing domain credentials over SMB, and the storage account must support identity-based access without introducing guest accounts or shared passwords.",
    stem: "What should you configure on the storage account?",
    subtopic: "Configure access to storage",
    referenceTopic: "Configure identity-based access for Azure Files",
    options: [
      option("A", "Anonymous blob access", "Anonymous access does not apply to SMB access for Azure Files."),
      option("B", "AD DS authentication for Azure Files", "Azure Files can integrate with on-premises AD DS for identity-based SMB access."),
      option("C", "A shared access signature", "SAS tokens do not provide traditional SMB identity-based domain authentication."),
      option("D", "Public read access", "Public read access is unrelated to SMB access and is insecure for the scenario."),
    ],
    correctOptionId: "B",
    explanation:
      "When existing on-premises AD DS identities must authenticate over SMB, Azure Files should be configured for AD DS-based authentication.",
  }),
  choiceQuestion({
    id: "Q2028",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Media",
    scenario:
      "You plan to enable object replication between two storage accounts for block blobs, and the design must preserve version history while keeping the replication setup simple to operate later.",
    stem: "Which feature must be enabled first before you configure replication?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Configure object replication",
    options: [
      option("A", "Blob versioning", "Object replication relies on versioning to track changes between source and destination."),
      option("B", "Blob soft delete", "Soft delete is useful for recovery but is not the prerequisite for object replication."),
      option("C", "NFS 3.0 support", "NFS support is unrelated to blob replication."),
      option("D", "A private endpoint", "Private connectivity is optional and not the replication prerequisite."),
    ],
    correctOptionId: "B",
    explanation:
      "Blob versioning is a core prerequisite for object replication between storage accounts and is required so changes can be tracked between source and destination.",
  }),
  choiceQuestion({
    id: "Q2029",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Graphic Design Institute",
    scenario:
      "Security policy requires a storage account to use customer-managed keys (CMK) for encryption at rest, and the security team must keep key ownership in a dedicated service while avoiding any dependency on alerting or networking resources.",
    stem: "Which Azure service must host the encryption key to satisfy that requirement?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Configure storage account encryption",
    options: [
      option("A", "Azure Key Vault", "Customer-managed keys for storage accounts are stored and managed in Key Vault."),
      option("B", "An action group", "Action groups handle alert actions and do not store encryption keys."),
      option("C", "A stored access policy", "Stored access policies govern SAS permissions, not storage encryption."),
      option("D", "A route table", "Route tables control network traffic and are unrelated to encryption keys."),
    ],
    correctOptionId: "A",
    explanation:
      "Storage accounts that use CMK retrieve their encryption keys from Azure Key Vault, which is the dedicated key management service for this scenario.",
  }),
  choiceQuestion({
    id: "Q2030",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Southridge Video",
    scenario: "A support team frequently overwrites the same blobs by mistake during bulk data operations. Recovery must be possible without restoring the entire storage account or involving a third-party backup system, and the team's junior staff must be able to perform recovery without extensive training.",
    stem: "Which feature should you enable to make recovery straightforward?",
    subtopic: "Configure Azure Files and Azure Blob Storage",
    referenceTopic: "Configure blob versioning",
    options: [
      option("A", "Blob versioning", "Versioning preserves previous blob versions when blobs are modified or overwritten."),
      option("B", "Archive tier", "Archive changes storage cost and retrieval behavior but does not retain overwritten versions."),
      option("C", "Stored access policies", "Stored access policies affect authorization rather than data recovery."),
      option("D", "File share snapshots", "File share snapshots apply to Azure Files, not blobs."),
    ],
    correctOptionId: "A",
    explanation:
      "Blob versioning is the direct feature used to recover prior blob contents after accidental overwrite operations.",
  }),
  multiSelectQuestion({
    id: "Q2031",
    domain: "D2",
    type: "multi-select",
    difficulty: "hard",
    company: "Coho Winery",
    scenario:
      "You need an automated rule that moves blobs to the Cool tier after 30 days and later deletes previous blob versions after 180 days, while keeping the storage account inexpensive to operate and preserving recoverability until the retention window closes. The storage team must avoid manual cleanup tasks and must keep the policy maintainable as the number of blobs grows.",
    stem: "Which two features should you configure to satisfy both parts of the policy? Each correct answer presents part of the solution.",
    subtopic: "Configure Azure Files and Azure Blob Storage",
    referenceTopic: "Configure blob lifecycle management and versioning",
    options: [
      option("A", "A lifecycle management policy", "Lifecycle management performs the automated tiering and deletion actions."),
      option("B", "Blob versioning", "Versioning must be enabled so previous versions exist to be cleaned up later."),
      option("C", "Premium performance", "Premium performance does not create retention or lifecycle behavior."),
      option("D", "SMB multichannel", "SMB multichannel is unrelated to blob tier transitions or version cleanup."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Lifecycle management provides the automation engine, and versioning is needed so there are prior versions to manage and eventually delete.",
  }),
  multiSelectQuestion({
    id: "Q2032",
    domain: "D2",
    type: "multi-select",
    difficulty: "hard",
    company: "Fabrikam Consulting",
    scenario:
      "Only servers in Subnet-App should reach a storage account over its public endpoint. Access from every other public network must be denied, while the public endpoint itself must remain available for the approved subnet.",
    stem: "Which two actions should you take to enforce that design? Each correct answer presents part of the solution.",
    subtopic: "Configure access to storage",
    referenceTopic: "Configure Azure Storage firewalls and virtual networks",
    options: [
      option("A", "Enable a Microsoft.Storage service endpoint on Subnet-App", "The subnet needs the service endpoint so Azure Storage firewall virtual network rules can be used."),
      option("B", "Add Subnet-App as a virtual network rule in the storage account firewall", "The storage firewall must explicitly trust the subnet."),
      option("C", "Create a public load balancer", "A load balancer is unrelated to storage firewall access control."),
      option("D", "Enable anonymous blob access", "Anonymous access weakens security and does not limit access to the subnet."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Service endpoints and storage firewall virtual network rules are the paired controls when the public endpoint must stay in use but access must be restricted to selected subnets.",
  }),
  multiSelectQuestion({
    id: "Q2033",
    domain: "D2",
    type: "multi-select",
    difficulty: "medium",
    company: "Wingtip Distribution",
    scenario:
      "An administrator must upload file content from a workstation into Azure Storage and wants two supported Microsoft tools that can handle both quick interactive uploads and scripted transfers without introducing third-party utilities.",
    stem: "Which two tools can you use? Each correct answer presents part of the solution.",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Manage data by using Azure Storage Explorer and AzCopy",
    options: [
      option("A", "Azure Storage Explorer", "Storage Explorer supports interactive upload, browse, and management for Azure Storage."),
      option("B", "AzCopy", "AzCopy supports command-line upload and download operations to Azure Storage."),
      option("C", "Azure Advisor", "Advisor provides recommendations and does not transfer files."),
      option("D", "Azure Service Health", "Service Health tracks incidents and maintenance events, not data transfer."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Storage Explorer and AzCopy are both first-party tools built for Azure Storage data management and movement.",
  }),
  yesNoQuestion({
    id: "Q2034",
    domain: "D2",
    type: "yes-no",
    difficulty: "easy",
    company: "Trey Research",
    scenario:
      "You are reviewing storage access and resiliency statements for a landing zone design review, and you must verify which controls affect access revocation, redundancy, and recovery behavior without guessing.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Configure access to storage",
    referenceTopic: "Configure stored access policies and redundancy",
    statements: [
      { id: "S1", text: "Deleting a stored access policy invalidates SAS tokens that depend on that policy.", answer: "Yes" },
      { id: "S2", text: "Zone-redundant storage protects against a complete regional outage.", answer: "No" },
      { id: "S3", text: "Blob soft delete helps recover deleted blobs for a defined retention period.", answer: "Yes" },
    ],
    explanation:
      "Stored access policy removal revokes policy-based SAS tokens, ZRS stays within one region, and blob soft delete provides time-bound recovery for deleted blobs.",
  }),
  dragDropQuestion({
    id: "Q2035",
    domain: "D2",
    type: "drag-drop",
    difficulty: "medium",
    company: "Adventure Works",
    scenario:
      "You want an application to use a SAS token that you can later revoke without rotating storage account keys, and the process must remain easy to manage for future token updates.",
    stem: "Arrange the actions in the correct order so revocation stays possible later.",
    subtopic: "Configure access to storage",
    referenceTopic: "Configure stored access policies",
    availableItems: [
      "Provide the SAS token to the application",
      "Create the stored access policy",
      "Generate a SAS token that references the policy",
    ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: ["Create the stored access policy", "Generate a SAS token that references the policy", "Provide the SAS token to the application"],
    explanation:
      "The policy must exist before a dependent SAS can be created and issued to the application.",
  }),
  choiceQuestion({
    id: "Q2036",
    domain: "D2",
    type: "hot-area",
    difficulty: "easy",
    company: "Litware Research",
    scenario:
      "In the redundancy dropdown for a new storage account, you must choose protection across availability zones in the primary region and replication to a secondary region without giving up regional resiliency.",
    stem: "Which redundancy option should you select?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Configure Azure Storage redundancy",
    options: [
      option("A", "LRS", "LRS keeps copies in one region only and does not add zone or regional resilience."),
      option("B", "ZRS", "ZRS protects across zones in the primary region but does not replicate to a secondary region."),
      option("C", "GZRS", "GZRS combines zone protection in the primary region with geo-replication to a secondary region."),
      option("D", "RA-GRS", "RA-GRS provides a readable secondary region but lacks primary-region zone redundancy."),
    ],
    correctOptionId: "C",
    explanation:
      "GZRS is the option that combines zonal resiliency in the primary region with geo-replication to a secondary region.",
  }),
  choiceQuestion({
    id: "Q2037",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Engineering",
    scenario:
      "Your team wants a concise, declarative language for Azure infrastructure that compiles to ARM JSON, and the deployment team must avoid switching to a general-purpose scripting tool for the template authoring step.",
    stem: "Which language should you use?",
    subtopic: "Automate deployment of resources by using Azure Resource Manager templates or Bicep files",
    referenceTopic: "Interpret a Bicep file",
    options: [
      option("A", "PowerShell", "PowerShell can automate deployments but is not the declarative language that compiles to ARM JSON."),
      option("B", "Bicep", "Bicep is the Azure-native domain-specific language that transpiles to ARM JSON."),
      option("C", "KQL", "KQL is used for querying logs, not defining infrastructure deployments."),
      option("D", "XML", "Azure Resource Manager deployments are not authored as XML."),
    ],
    correctOptionId: "B",
    explanation:
      "Bicep is the concise declarative language designed for Azure deployments and compiles into ARM template JSON.",
  }),
  choiceQuestion({
    id: "Q2038",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Proseware",
    scenario:
      "You need a starting ARM template that reflects resources already deployed in a resource group, but you do not want to rebuild the template manually or capture unrelated subscriptions. The exported template must help you preserve the current design without starting from scratch.",
    stem: "Which Azure capability should you use?",
    subtopic: "Automate deployment of resources by using Azure Resource Manager templates or Bicep files",
    referenceTopic: "Export a deployment as an Azure Resource Manager template",
    options: [
      option("A", "Export template from the resource group", "Export template captures the current resource configuration as ARM JSON."),
      option("B", "Azure Policy remediation", "Remediation fixes policy drift but does not export deployment artifacts."),
      option("C", "VM backup", "Backups preserve workload data, not infrastructure definitions."),
      option("D", "Azure Bastion", "Bastion provides secure remote access and does not export templates."),
    ],
    correctOptionId: "A",
    explanation:
      "Export template is the portal feature used to generate an ARM template from existing Azure resources.",
  }),
  choiceQuestion({
    id: "Q2039",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "A business-critical virtual machine must remain available if one datacenter in the region fails. The region supports availability zones, and the deployment must protect the workload without requiring a separate regional redesign.",
    stem: "How should you deploy the virtual machine?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Deploy virtual machines to availability zones and availability sets",
    options: [
      option("A", "Into an availability set only", "Availability sets protect inside a datacenter boundary and do not provide zonal separation."),
      option("B", "Into an availability zone", "Availability zones place compute in physically separate datacenters within the region."),
      option("C", "On a dedicated host", "Dedicated hosts isolate physical servers but do not inherently provide zonal resiliency."),
      option("D", "As an Azure Container Instance", "ACI is a container service and not a virtual machine deployment option."),
    ],
    correctOptionId: "B",
    explanation:
      "Availability zones are the right choice when you need protection against a datacenter-level outage in a supported region.",
  }),
  choiceQuestion({
    id: "Q2040",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Humongous Insurance",
    scenario:
      "You plan to move VM1 to another resource group in the same subscription by using the Azure portal move operation, and the move must keep the workload consistent without breaking attached dependencies.",
    stem: "What should you include in the move request with the virtual machine?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Move a virtual machine to another resource group, subscription, or region",
    options: [
      option("A", "Only the virtual machine resource", "A VM move usually requires its dependent resources such as NICs and disks to move together."),
      option("B", "The virtual machine and its dependent resources", "Dependent resources must be included so the move remains consistent and valid."),
      option("C", "Only the managed disk", "The disk alone is insufficient because the VM depends on more than just storage."),
      option("D", "Only the resource group", "Resource groups themselves are not moved; resources are moved between them."),
    ],
    correctOptionId: "B",
    explanation:
      "VM moves typically require you to move the virtual machine together with the dependent NIC and storage resources.",
  }),
  choiceQuestion({
    id: "Q2041",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Litware Labs",
    scenario:
      "A security baseline requires encryption of the temporary disk and host cache for supported Azure virtual machines while leaving guest-level data protection unchanged. The control must cover supported VM sizes without relying only on in-guest encryption.",
    stem: "Which feature should you enable?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Configure encryption at host for Azure virtual machines",
    options: [
      option("A", "Azure Disk Encryption", "Azure Disk Encryption protects OS and data disks in-guest, but not the host cache and temporary disk requirement stated here."),
      option("B", "Server-side encryption with platform-managed keys only", "Server-side encryption at rest does not satisfy the host cache and temporary disk requirement."),
      option("C", "Encryption at host", "Encryption at host specifically covers the host cache and temporary disk on supported VM sizes."),
      option("D", "BitLocker inside the guest OS only", "Guest OS encryption alone does not provide host-level encryption coverage."),
    ],
    correctOptionId: "C",
    explanation:
      "Encryption at host is the Azure feature specifically intended to encrypt the host cache and temporary disk for supported virtual machines.",
  }),
  choiceQuestion({
    id: "Q2042",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "A. Datum Corporation",
    scenario:
      "A SQL Server virtual machine needs high and predictable disk performance, but it does not need the specific sub-millisecond latency profile of Ultra disks. The storage choice must support production workloads without adding unnecessary complexity.",
    stem: "Which managed disk type should you choose?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Manage virtual machine disks",
    options: [
      option("A", "Standard HDD", "Standard HDD is the lowest-cost option and is not suitable for high, predictable performance."),
      option("B", "Standard SSD", "Standard SSD improves latency but is not the best fit for the stated performance requirement."),
      option("C", "Premium SSD", "Premium SSD is the common choice for high-performance VM workloads that do not require Ultra Disk behavior."),
      option("D", "Ephemeral OS disk", "Ephemeral OS disk is a deployment choice for stateless OS disks, not a persistent high-performance data disk option."),
    ],
    correctOptionId: "C",
    explanation:
      "Premium SSD is the standard choice for production VM workloads that need strong and predictable disk performance short of Ultra Disk requirements.",
  }),
  choiceQuestion({
    id: "Q2043",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Trey Research",
    scenario:
      "A web tier must run across identical VM instances and automatically scale from 2 to 10 instances based on CPU utilization. The team wants scale-out behavior without redesigning the application for a different hosting model.",
    stem: "Which Azure compute resource should you deploy?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Deploy and configure an Azure Virtual Machine Scale Sets",
    options: [
      option("A", "An availability set", "Availability sets improve resiliency for a fixed set of VMs but do not provide built-in autoscale."),
      option("B", "A virtual machine scale set", "VM scale sets are designed for identical instances with autoscale support."),
      option("C", "A dedicated host", "Dedicated hosts allocate physical servers and do not provide scale-out behavior by themselves."),
      option("D", "A Recovery Services vault", "A Recovery Services vault provides backup and disaster recovery, not VM execution or scaling."),
    ],
    correctOptionId: "B",
    explanation:
      "Virtual machine scale sets are the Azure-native construct for managing identical VM instances with autoscale behavior.",
  }),
  choiceQuestion({
    id: "Q2044",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Woodgrove Bank",
    scenario: "A data processing pipeline must run a containerized batch task for 30 minutes daily without managing servers, clusters, or paying for idle compute time. Cost efficiency is critical since this runs across multiple time zones.",
    stem: "Which service should you use?",
    subtopic: "Provision and manage containers in the Azure portal",
    referenceTopic: "Provision a container by using Azure Container Instances",
    options: [
      option("A", "Azure Container Instances", "ACI is built for simple container execution without managing infrastructure."),
      option("B", "Azure Kubernetes Service", "AKS is more operationally heavy than required for a short single-container task."),
      option("C", "Azure Backup", "Azure Backup protects workloads and does not run containers."),
      option("D", "Azure Bastion", "Bastion provides secure remote access and is unrelated to container execution."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Container Instances are appropriate for quickly running containerized workloads without cluster management overhead.",
  }),
  choiceQuestion({
    id: "Q2045",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Health",
    scenario:
      "A containerized HTTP microservice needs revision support, automatic scaling, and the ability to scale to zero when idle. The platform team must keep the service managed without taking on Kubernetes operations.",
    stem: "Which Azure service should you use?",
    subtopic: "Provision and manage containers in the Azure portal",
    referenceTopic: "Provision a container by using Azure Container Apps",
    options: [
      option("A", "Azure Container Registry", "ACR stores images but does not execute containerized web services."),
      option("B", "Azure Container Instances", "ACI can run containers, but Container Apps is the better fit for HTTP ingress, revisions, and scale-to-zero."),
      option("C", "Azure Container Apps", "Container Apps is designed for managed containerized applications with revisions and scale-to-zero."),
      option("D", "Azure Site Recovery", "Site Recovery is for disaster recovery, not application hosting."),
    ],
    correctOptionId: "C",
    explanation:
      "Azure Container Apps best matches the requirement for HTTP-based container apps with managed scaling, revisions, and scale-to-zero behavior.",
  }),
  choiceQuestion({
    id: "Q2046",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Consolidated Messenger",
    scenario:
      "Your developers need a private Azure service to store and manage container images without publishing those images to a public registry.",
    stem: "Which service should you deploy?",
    subtopic: "Provision and manage containers in the Azure portal",
    referenceTopic: "Create and manage an Azure Container Registry",
    options: [
      option("A", "Azure Container Registry", "ACR is the private container image registry service for Azure."),
      option("B", "Azure App Service", "App Service hosts applications but is not an image registry."),
      option("C", "Azure Monitor", "Azure Monitor collects telemetry and does not store images."),
      option("D", "Azure DNS", "Azure DNS hosts DNS zones and is unrelated to container images."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Container Registry is the correct private service for storing and managing container images.",
  }),
  choiceQuestion({
    id: "Q2047",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Blue Yonder Airlines",
    scenario: "An App Service app must be reachable by the existing subdomain app.contoso.com. The DNS change must work without moving the app to a different hosting platform or requiring SSL/TLS certificate redirection complications.",
    stem: "Which DNS record type is commonly used for this App Service custom domain mapping?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Map an existing custom DNS name to an App Service",
    options: [
      option("A", "PTR", "PTR records are used for reverse DNS lookups."),
      option("B", "SRV", "SRV records describe service endpoints and are not the standard choice here."),
      option("C", "CNAME", "CNAME is commonly used for mapping an App Service subdomain to the app's default hostname."),
      option("D", "MX", "MX records are used for mail routing, not web app hostname mapping."),
    ],
    correctOptionId: "C",
    explanation:
      "A CNAME record is the common choice when mapping a subdomain to an App Service hostname.",
  }),
  choiceQuestion({
    id: "Q2048",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Lucerne Publishing",
    scenario:
      "You need to deploy a new App Service version, warm it up, validate it, and then move production traffic with minimal downtime. The release process must let you test the new build while keeping the live site available, while avoiding a direct cutover that would increase outage risk.",
    stem: "Which App Service feature should you use?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Configure deployment slots for an App Service",
    options: [
      option("A", "A deployment slot swap", "Deployment slots support staged validation and controlled cutover with minimal downtime."),
      option("B", "A manual stop and redeploy", "Stopping the app increases downtime and removes the warm-up benefit."),
      option("C", "A backup restore", "Backup restore is for recovery and not the normal release mechanism."),
      option("D", "A scale up operation", "Scaling up changes compute size but does not stage and swap application versions."),
    ],
    correctOptionId: "A",
    explanation:
      "Deployment slots are designed for low-downtime App Service releases and support warming and validation before swap.",
  }),
  choiceQuestion({
    id: "Q2049",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Adventure Works",
    scenario:
      "A web app must automatically scale out based on CPU usage, and the business wants the smallest plan tier that supports autoscale without paying for a higher tier than necessary.",
    stem: "What is the minimum App Service plan tier that supports this requirement?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Configure scaling for an App Service plan",
    options: [
      option("A", "Free", "Free does not support autoscale."),
      option("B", "Shared", "Shared does not support autoscale."),
      option("C", "Basic", "Basic supports manual scale but not autoscale."),
      option("D", "Standard", "Standard is the first commonly used tier that supports autoscale features."),
    ],
    correctOptionId: "D",
    explanation:
      "Standard and higher App Service plan tiers support autoscale, whereas Free, Shared, and Basic do not.",
  }),
  multiSelectQuestion({
    id: "Q2050",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Contoso Engineering",
    scenario:
      "Your team is standardizing on Bicep for Azure infrastructure automation and must explain it clearly to developers who are used to ARM JSON templates. The team must understand what Bicep does and what it does not replace.",
    stem: "Which two statements about Bicep are correct? Each correct answer presents part of the solution.",
    subtopic: "Automate deployment of resources by using Azure Resource Manager templates or Bicep files",
    referenceTopic: "Interpret and deploy Bicep files",
    options: [
      option("A", "Bicep files compile to ARM template JSON", "Bicep transpiles into ARM JSON before deployment."),
      option("B", "Bicep files can be deployed at the resource group scope", "Bicep supports deployment to resource groups and other scopes."),
      option("C", "Bicep replaces RBAC role assignments entirely", "RBAC still exists and is not replaced by Bicep."),
      option("D", "Bicep is used to query Azure Monitor logs", "KQL is used for querying logs, not Bicep."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Bicep is a deployment authoring language that compiles to ARM JSON and supports resource-group-scope deployments.",
  }),
  multiSelectQuestion({
    id: "Q2051",
    domain: "D3",
    type: "multi-select",
    difficulty: "hard",
    company: "Wingtip Software",
    scenario:
      "You want Azure Container Apps to pull images from a private Azure Container Registry without using registry admin credentials. The solution must remain passwordless and cannot expose the registry to anonymous pulls.",
    stem: "Which two actions should you take? Each correct answer presents part of the solution.",
    subtopic: "Provision and manage containers in the Azure portal",
    referenceTopic: "Create and manage an Azure Container Registry and provision Azure Container Apps",
    options: [
      option("A", "Configure the container app to authenticate to the registry by using a managed identity", "Managed identity is the preferred passwordless pattern for registry access from Container Apps."),
      option("B", "Grant the managed identity the AcrPull role on the registry", "AcrPull is the registry permission that allows image pulls without admin credentials."),
      option("C", "Enable anonymous pull on the registry", "Anonymous pull weakens security and is unnecessary for this requirement."),
      option("D", "Create a route table", "Route tables do not grant registry authorization."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "The correct secure pattern is to use a managed identity and grant it AcrPull on the registry.",
  }),
  multiSelectQuestion({
    id: "Q2052",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Coho Winery",
    scenario:
      "You want to reduce risk during App Service releases by validating a new build before users receive it. The release process must support a safe pre-production check and a low-downtime cutover without deploying straight to production.",
    stem: "Which two actions should you take? Each correct answer presents part of the solution.",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Configure deployment slots for an App Service",
    options: [
      option("A", "Create a staging deployment slot", "A staging slot gives you an isolated location for validation before production swap."),
      option("B", "Deploy the new build directly to production", "Direct production deployment removes the safe validation stage."),
      option("C", "Swap the validated slot into production", "Swapping after validation is the standard low-downtime release step."),
      option("D", "Delete the default production slot", "The production slot is required and should not be deleted."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "C"],
    explanation:
      "Deployment slots reduce release risk by letting you validate in staging and then swap into production.",
  }),
  multiSelectQuestion({
    id: "Q2053",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "A. Datum Corporation",
    scenario:
      "Before a risky App Service release, the operations team wants a backup they can restore if needed, while keeping the app on a supported tier and preserving a restore target outside the app itself.",
    stem: "Which two conditions or actions are required? Each correct answer presents part of the solution.",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Configure backup for an App Service",
    options: [
      option("A", "Use an App Service plan that supports backups, such as Standard or higher", "Backups require a plan tier that supports the feature."),
      option("B", "Configure a storage account container for the backup target", "App Service backups write to an Azure Storage account."),
      option("C", "Enable Azure Site Recovery on the app", "Site Recovery does not provide App Service backup functionality."),
      option("D", "Move the app to the Free tier", "Free tier does not support backups."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "App Service backups require a supporting plan tier and a storage destination to hold the backup artifacts.",
  }),
  yesNoQuestion({
    id: "Q2054",
    domain: "D3",
    type: "yes-no",
    difficulty: "easy",
    company: "Litware Logistics",
    scenario:
      "You are reviewing statements about compute services in Azure before approving a deployment standard, and the team must avoid incorrect guidance that would affect autoscaling, container hosting, or release workflows.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "Create and configure virtual machines, containers, and App Service",
    statements: [
      { id: "S1", text: "Virtual machine scale sets can automatically add instances based on autoscale rules.", answer: "Yes" },
      { id: "S2", text: "Azure Container Instances require Azure Container Registry for every deployment.", answer: "No" },
      { id: "S3", text: "Deployment slot swaps can reduce downtime during App Service releases.", answer: "Yes" },
    ],
    explanation:
      "VM scale sets support autoscale, ACI can use images from other supported registries, and deployment slots help reduce release downtime.",
  }),
  yesNoQuestion({
    id: "Q2055",
    domain: "D3",
    type: "yes-no",
    difficulty: "medium",
    company: "Fourth Coffee",
    scenario:
      "You are validating high-availability and container statements for an architecture review, and the design must support regional resilience and host-level encryption without introducing incorrect platform assumptions.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Deploy virtual machines to availability zones and configure encryption at host",
    statements: [
      { id: "S1", text: "Availability zones protect virtual machines from a datacenter-level failure within a region.", answer: "Yes" },
      { id: "S2", text: "Encryption at host encrypts the temporary disk and host cache for supported virtual machines.", answer: "Yes" },
      { id: "S3", text: "Azure Container Registry can store only Linux images.", answer: "No" },
    ],
    explanation:
      "Availability zones are zonal resiliency boundaries, encryption at host covers temp disk and cache, and ACR can store both Linux and Windows container images.",
  }),
  dragDropQuestion({
    id: "Q2056",
    domain: "D3",
    type: "drag-drop",
    difficulty: "medium",
    company: "Graphic Design Institute",
    scenario:
      "You are deploying a new environment from a Bicep file at the resource group scope. The team must keep the rollout repeatable, validate parameter overrides for cost estimation before applying them, and avoid manual cleanup after each deployment.",
    stem: "Arrange the actions in the correct order so the deployment succeeds without manual cleanup or unexpected costs.",
    subtopic: "Automate deployment of resources by using Azure Resource Manager templates or Bicep files",
    referenceTopic: "Deploy resources by using a Bicep file",
    availableItems: [
    "Create the resource group",
    "Validate the Bicep template with parameters",
    "Run the Bicep deployment",
    "Review the deployment outputs"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: ["Create the resource group", "Validate the Bicep template with parameters", "Run the Bicep deployment", "Review the deployment outputs"],
    explanation:
      "The target scope must exist first, then validate the template to catch errors and cost overruns before deployment, deploy, and finally review outputs to confirm expected results.",
  }),
  dragDropQuestion({
    id: "Q2057",
    domain: "D3",
    type: "drag-drop",
    difficulty: "hard",
    company: "Northwind Traders",
    scenario:
      "You are preparing a blue-green release for an App Service that supports a customer portal used during business hours. Operations must keep the live site online while the new build is validated in isolation, and the team must preserve a rollback path if smoke tests fail before any production traffic is switched.",
    stem: "Arrange the actions in the correct order so validation happens before production traffic is swapped.",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Configure deployment slots for an App Service",
    availableItems: [
    "Deploy the new build to the staging slot",
    "Create a staging slot",
    "Swap the staging slot into production"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: ["Create a staging slot", "Deploy the new build to the staging slot", "Swap the staging slot into production"],
    explanation:
      "A proper slot-based release creates or uses a staging slot, deploys there, and swaps only after validation is complete.",
  }),
  choiceQuestion({
    id: "Q2058",
    domain: "D3",
    type: "hot-area",
    difficulty: "medium",
    company: "Contoso Digital",
    scenario:
      "You are editing an App Service app in the Azure portal and must require clients to use TLS 1.2 or newer while leaving the rest of the app configuration unchanged.",
    stem: "Which setting should you change?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Configure certificates and Transport Layer Security (TLS) for an App Service",
    options: [
      option("A", "Minimum TLS Version", "This is the App Service setting that enforces the minimum accepted TLS protocol version."),
      option("B", "ARR Affinity", "ARR Affinity controls session stickiness, not TLS version enforcement."),
      option("C", "Always On", "Always On keeps the app warm but does not set TLS requirements."),
      option("D", "Platform bitness", "Platform bitness selects 32-bit or 64-bit runtime behavior, not TLS behavior."),
    ],
    correctOptionId: "A",
    explanation:
      "The Minimum TLS Version setting is the correct place to enforce a TLS 1.2 baseline for App Service.",
  }),
  choiceQuestion({
    id: "Q2059",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Fabrikam Software",
    scenario:
      "Two Azure virtual networks in the same region must communicate privately with low latency over the Microsoft backbone.",
    stem: "Which feature should you use?",
    subtopic: "Configure and manage virtual networks in Azure",
    referenceTopic: "Create and configure virtual network peering",
    options: [
      option("A", "Virtual network peering", "VNet peering provides private IP connectivity between Azure virtual networks over the Azure backbone."),
      option("B", "A public load balancer", "A load balancer distributes traffic and does not connect two virtual networks together."),
      option("C", "A recovery vault", "Recovery vaults are for backup and disaster recovery."),
      option("D", "Azure Policy", "Policy enforces governance and does not create network connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "Virtual network peering is the Azure-native feature for private connectivity between VNets.",
  }),
  choiceQuestion({
    id: "Q2060",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Woodgrove Bank",
    scenario:
      "All outbound traffic from Subnet-App must pass through a firewall virtual machine at 10.0.0.4 while keeping the subnet isolated from direct internet egress.",
    stem: "Which Azure networking feature should you configure?",
    subtopic: "Configure and manage virtual networks in Azure",
    referenceTopic: "Configure user-defined routes",
    options: [
      option("A", "A route table with a custom route", "User-defined routes in a route table let you send traffic to a virtual appliance."),
      option("B", "An application security group", "ASGs group NICs for NSG rules and do not define routing paths."),
      option("C", "A public IP address", "A public IP alone does not direct subnet traffic through a firewall."),
      option("D", "Azure DNS", "Azure DNS resolves names and does not control next-hop routing."),
    ],
    correctOptionId: "A",
    explanation:
      "A route table with a custom next hop to a virtual appliance is the standard way to steer subnet traffic through a firewall VM.",
  }),
  choiceQuestion({
    id: "Q2061",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Blue Yonder Airlines",
    scenario:
      "A VM cannot receive traffic that you believe an NSG should allow. You must verify the combined rules that are actually applied to the VM's NIC without guessing which rule set is winning.",
    stem: "Which Azure tool or view should you use?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Evaluate effective security rules in NSGs",
    options: [
      option("A", "Effective security rules", "The effective security rules view shows the resulting NSG behavior on the NIC."),
      option("B", "Azure Advisor", "Advisor does not show the merged NSG decision path for a NIC."),
      option("C", "A budget alert", "Budgets do not help troubleshoot packet filtering."),
      option("D", "Resource locks", "Locks protect resources from changes and do not show packet filtering."),
    ],
    correctOptionId: "A",
    explanation:
      "Effective security rules are the right diagnostic view when you need to understand the final NSG behavior on a network interface.",
  }),
  choiceQuestion({
    id: "Q2062",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Operations",
    scenario: "Administrators must connect to Azure virtual machines over RDP and SSH without exposing those VMs with public IP addresses. Audit and compliance teams must be able to review access logs for the administrative sessions.",
    stem: "Which service should you deploy?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Implement Azure Bastion",
    options: [
      option("A", "Azure Bastion", "Azure Bastion provides browser-based RDP and SSH to VMs without public IPs on the VM NICs."),
      option("B", "Azure DNS", "Azure DNS hosts DNS records and does not provide remote access."),
      option("C", "A jump host VM with a public IP", "A jump host VM can provide access but requires a public IP on the VM, violating the no-public-IP requirement."),
      option("D", "A recovery vault", "Recovery vaults do not provide interactive VM access."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Bastion is purpose-built for secure management access to Azure VMs without public IP exposure; it provides browser-based RDP/SSH access and audit logging without placing public IPs on the VMs themselves.",
  }),
  choiceQuestion({
    id: "Q2063",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Litware Manufacturing",
    scenario:
      "Subnet-App must reach an Azure Storage account over the Azure backbone while the storage account continues to use its public endpoint. The design must keep the public endpoint in place without exposing the storage account to every network.",
    stem: "Which feature should you configure?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Configure service endpoints for Azure platform as a service (PaaS)",
    options: [
      option("A", "A service endpoint", "Service endpoints keep the PaaS public endpoint but extend VNet identity to it over the Azure backbone."),
      option("B", "A private endpoint", "A private endpoint assigns a private IP to the service connection instead of using the public endpoint."),
      option("C", "An application security group", "ASGs categorize NICs for NSG rules and do not connect to PaaS services."),
      option("D", "A public IP prefix", "A public IP prefix allocates public addresses and does not solve subnet-to-PaaS connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "Service endpoints extend a subnet's identity to reach a PaaS service's public endpoint over the Azure backbone, allowing private connectivity without exposing the PaaS service to every network on the internet; private endpoints use a different mechanism (private IP inside your VNet) and are a separate feature for different scenarios.",
  }),
  choiceQuestion({
    id: "Q2064",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Southridge Video",
    scenario:
      "An Azure SQL Database must be reachable only over a private IP address from an application subnet, and the solution must avoid using the public internet path.",
    stem: "Which feature should you configure?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Configure private endpoints for Azure PaaS",
    options: [
      option("A", "A service endpoint", "Service endpoints do not place a private IP for the PaaS service into your VNet."),
      option("B", "A private endpoint", "Private endpoints map the service connection to a private IP in your VNet."),
      option("C", "A route table only", "A route table cannot create private service connectivity on its own."),
      option("D", "A public load balancer", "A public load balancer exposes services to the internet and is not needed here."),
    ],
    correctOptionId: "B",
    explanation:
      "Private endpoints are the correct feature when a PaaS service must be reachable over a private IP from your virtual network.",
  }),
  choiceQuestion({
    id: "Q2065",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Fourth Coffee",
    scenario:
      "Your company must use Microsoft-hosted authoritative DNS for the public internet domain contoso.com without delegating the zone to a third-party DNS provider.",
    stem: "Which service should you use?",
    subtopic: "Configure name resolution and load balancing",
    referenceTopic: "Configure Azure DNS",
    options: [
      option("A", "Azure DNS", "Azure DNS hosts authoritative public and private DNS zones in Azure."),
      option("B", "Azure Private DNS only", "Private DNS zones are for internal name resolution and do not host a public internet domain."),
      option("C", "Azure Traffic Manager", "Traffic Manager is a DNS-based load balancer for routing user traffic, not for hosting authoritative DNS zones."),
      option("D", "Azure Policy", "Policy does not provide DNS hosting."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure DNS is the Azure service used to host authoritative DNS zones for public domains such as contoso.com.",
  }),
  choiceQuestion({
    id: "Q2066",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Graphic Design Institute",
    scenario:
      "Two web virtual machines must receive inbound TCP 443 traffic from the internet by using a single Azure frontend IP. TLS offload is not required, and the platform must stay at layer 4 rather than adding an application gateway.",
    stem: "Which Azure service should you deploy?",
    subtopic: "Configure name resolution and load balancing",
    referenceTopic: "Configure an internal or public load balancer",
    options: [
      option("A", "A public load balancer", "A public load balancer can distribute inbound TCP traffic from a public frontend IP to backend virtual machines."),
      option("B", "An internal load balancer", "An internal load balancer is private and not reachable from the internet."),
      option("C", "An application security group", "An ASG groups NICs for NSG rules and does not distribute traffic."),
      option("D", "A route table", "Route tables define routing and do not provide inbound load distribution."),
    ],
    correctOptionId: "A",
    explanation:
      "A public Azure Load Balancer is the correct choice for L4 traffic distribution from a public frontend IP to Azure VMs.",
  }),
  choiceQuestion({
    id: "Q2067",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Trey Research",
    scenario:
      "An internal line-of-business application must be load balanced only for clients inside the virtual network and connected on-premises networks. The service must remain private while still allowing shared access across internal consumers.",
    stem: "Which load-balancing option should you use?",
    subtopic: "Configure name resolution and load balancing",
    referenceTopic: "Configure an internal or public load balancer",
    options: [
      option("A", "An internal load balancer", "An internal load balancer exposes a private frontend IP for internal consumers only."),
      option("B", "A public load balancer", "A public load balancer exposes a public frontend IP to internet clients."),
      option("C", "A public IP prefix", "A public IP prefix allocates addresses and does not itself balance traffic."),
      option("D", "A storage firewall", "A storage firewall controls storage access and is unrelated to application load balancing."),
    ],
    correctOptionId: "A",
    explanation:
      "An internal load balancer is the correct choice when the service should stay private and reachable only across internal networks.",
  }),
  choiceQuestion({
    id: "Q2068",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Contoso Retail",
    scenario:
      "A backend VM in a Standard Load Balancer pool is always reported unhealthy after a subnet NSG was tightened for a production change freeze. The team must restore probe health without broadly opening inbound traffic to the application port or weakening the subnet's general protection, while still keeping the backend protected from unrelated client traffic.",
    stem: "Which NSG rule is most likely missing if you want the backend to stay protected?",
    subtopic: "Configure name resolution and load balancing",
    referenceTopic: "Troubleshoot load balancing",
    options: [
      option("A", "An inbound allow rule from the AzureLoadBalancer service tag", "Health probes originate from AzureLoadBalancer and the backend can remain unhealthy if that traffic is blocked."),
      option("B", "An outbound deny rule to the Internet service tag", "Outbound deny rules do not directly fix inbound health probe failures."),
      option("C", "An inbound allow rule from the VirtualNetwork service tag only", "VirtualNetwork alone does not specifically allow the Azure load balancer probe source."),
      option("D", "A route table association", "Routing is not the first missing control indicated by a blocked health probe."),
    ],
    correctOptionId: "A",
    explanation:
      "If the AzureLoadBalancer service tag is blocked by NSG rules, health probes cannot reach the backend instance and the load balancer marks it unhealthy.",
  }),
  choiceQuestion({
    id: "Q2069",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Payments",
    scenario:
      "You are deploying a Standard public load balancer and want a resilient public IP that is explicitly allocated and retained. The frontend must keep the same address across service updates without relying on dynamic allocation.",
    stem: "Which public IP configuration should you choose?",
    subtopic: "Configure and manage virtual networks in Azure",
    referenceTopic: "Configure public IP addresses",
    options: [
      option("A", "Basic SKU, dynamic allocation", "Basic is not aligned with the Standard load balancer requirement and dynamic addressing can change."),
      option("B", "Standard SKU, static allocation", "Standard public IPs are used with Standard load balancers and should be static for a fixed frontend address."),
      option("C", "Basic SKU, static allocation", "Basic is the wrong SKU pairing for a Standard load balancer."),
      option("D", "Private IP only", "A public load balancer frontend needs a public IP when it must be internet facing."),
    ],
    correctOptionId: "B",
    explanation:
      "A Standard Load Balancer should use a Standard SKU public IP, and static allocation preserves the address.",
  }),
  multiSelectQuestion({
    id: "Q2070",
    domain: "D4",
    type: "multi-select",
    difficulty: "hard",
    company: "Northwind Traders",
    scenario:
      "A storage account uses a private endpoint. Virtual machines in VNet-App must resolve the storage account FQDN to the private endpoint address, and the DNS configuration must work without exposing the service to the public internet.",
    stem: "Which two actions should you take? Each correct answer presents part of the solution.",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Configure private endpoints for Azure PaaS",
    options: [
      option("A", "Create the appropriate private DNS zone for the private endpoint service", "Private DNS zones provide the internal records that map the service FQDN to the private endpoint IP."),
      option("B", "Link the private DNS zone to VNet-App", "The consuming VNet must be linked so clients there use the private records."),
      option("C", "Enable an NSG flow log", "Flow logs do not create DNS records or resolution behavior."),
      option("D", "Create a public IP address for the private endpoint", "Private endpoints use private IPs and do not need public IPs."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Private endpoint name resolution requires the correct private DNS zone (which holds the DNS records) and a VNet link (which makes those records resolvable from the consuming network). Without the VNet link, records exist but are invisible to clients in the VNet.",
  }),
  multiSelectQuestion({
    id: "Q2071",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Southridge Video",
    scenario:
      "An NSG design is becoming hard to manage across many web and database servers. You want to reduce rule maintenance, target rules at groups of NICs, and keep the design maintainable as new workloads are added without rewriting every rule set or duplicating the same allow rules in each NSG.",
    stem: "Which two features must you use to reduce rule maintenance without duplicating the same logic in every NSG? Each correct answer presents part of the solution.",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Create and configure network security groups (NSGs) and application security groups",
    options: [
      option("A", "Application security groups", "ASGs let you target NSG rules at logical groups of NICs."),
      option("B", "Service tags", "Service tags simplify rules that target Azure service address ranges."),
      option("C", "Recovery Services vaults", "Recovery Services vaults are unrelated to packet filtering design."),
      option("D", "Management groups", "Management groups organize subscriptions and do not simplify individual NSG rules."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Application security groups simplify NSG rules between your own resources by allowing you to target groups of NICs without rewriting every rule; service tags simplify rules for Azure-managed services because Microsoft automatically updates the IP ranges when services change their public endpoints.",
  }),
  multiSelectQuestion({
    id: "Q2072",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Fourth Coffee",
    scenario:
      "Outbound traffic from Subnet-App must pass through a firewall VM at 10.0.0.4, and the route must take effect without forcing a redesign of the subnet layout.",
    stem: "Which two actions should you take? Each correct answer presents part of the solution.",
    subtopic: "Configure and manage virtual networks in Azure",
    referenceTopic: "Configure user-defined routes",
    options: [
      option("A", "Create a route table that contains a route pointing to 10.0.0.4 as a virtual appliance", "A custom route defines the virtual appliance as the next hop."),
      option("B", "Associate the route table with Subnet-App", "The route table must be associated to the subnet for the route to apply."),
      option("C", "Enable Azure Bastion", "Bastion provides administration access and does not redirect subnet traffic."),
      option("D", "Create a public IP for every VM in the subnet", "Public IPs are unnecessary for steering traffic to the firewall."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "A UDR is effective only when it exists in a route table and that route table is associated with the target subnet.",
  }),
  yesNoQuestion({
    id: "Q2073",
    domain: "D4",
    type: "yes-no",
    difficulty: "easy",
    company: "Tailwind Traders",
    scenario:
      "You are reviewing basic Azure networking statements for a foundation-level design review, and the team must avoid mixing up private connectivity, admin access, and route behavior.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Configure and manage virtual networks in Azure",
    referenceTopic: "Create and configure virtual network peering and user-defined routes",
    statements: [
      { id: "S1", text: "Virtual network peering allows private IP connectivity between peered virtual networks.", answer: "Yes" },
      { id: "S2", text: "A public IP address is required on a VM that is accessed through Azure Bastion.", answer: "No" },
      { id: "S3", text: "A user-defined route can direct traffic to a virtual appliance.", answer: "Yes" },
    ],
    explanation:
      "VNet peering provides private connectivity, Bastion removes the need for VM public IPs, and UDRs can point to virtual appliances.",
  }),
  yesNoQuestion({
    id: "Q2074",
    domain: "D4",
    type: "yes-no",
    difficulty: "hard",
    company: "Adventure Works",
    scenario:
      "You are checking secure PaaS connectivity and load balancer troubleshooting statements for a production review. The design must preserve private connectivity while still allowing you to diagnose unhealthy backends without weakening access controls.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Configure private endpoints, service endpoints, and troubleshoot load balancing",
    statements: [
      { id: "S1", text: "A private endpoint assigns a private IP address from your virtual network to the service connection.", answer: "Yes" },
      { id: "S2", text: "A service endpoint removes the public endpoint of the PaaS service.", answer: "No" },
      { id: "S3", text: "If a load balancer health probe is blocked, the backend instance can be marked unhealthy.", answer: "Yes" },
    ],
    explanation:
      "Private endpoints assign a private IP from your VNet to the service (replacing the public endpoint for your traffic); service endpoints keep the public endpoint but extend your VNet's identity to it over the Azure backbone; and blocked health probes are a common cause of backend marking as unhealthy, especially if NSG rules inadvertently block the AzureLoadBalancer service tag.",
  }),
  dragDropQuestion({
    id: "Q2075",
    domain: "D4",
    type: "drag-drop",
    difficulty: "medium",
    company: "Lucerne Publishing",
    scenario:
      "You are deploying an Azure Load Balancer for an internal application. The health probe must be configured to detect backend failures within 30 seconds, and the rule must tie everything together so traffic is routed only to healthy backends.",
    stem: "Arrange the actions in the correct order so the load balancer monitors backend health and routes traffic appropriately.",
    subtopic: "Configure name resolution and load balancing",
    referenceTopic: "Configure an internal or public load balancer",
    availableItems: [
    "Create the frontend IP configuration",
    "Create the backend pool",
    "Create the health probe",
    "Create the load-balancing rule"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: ["Create the frontend IP configuration", "Create the backend pool", "Create the health probe", "Create the load-balancing rule"],
    explanation:
      "Define the frontend IP and backend pool first, then configure the health probe to detect failures, and finally link everything with the load-balancing rule so traffic routes only to healthy instances.",
  }),
  dragDropQuestion({
    id: "Q2076",
    domain: "D4",
    type: "drag-drop",
    difficulty: "hard",
    company: "Contoso Payments",
    scenario:
      "A virtual machine in a subnet cannot reach a remote endpoint during an incident review. The operations team must check effective configuration first so they can avoid random packet tests or NIC changes unless the routing and security evidence points there, while keeping the investigation orderly for the on-call team.",
    stem: "Arrange the troubleshooting actions in the correct order so the diagnostic flow stays disciplined.",
    subtopic: "Configure and manage virtual networks in Azure",
    referenceTopic: "Troubleshoot network connectivity",
    availableItems: [
    "Review effective routes",
    "Review effective security rules",
    "Run a Network Watcher connection troubleshoot"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: ["Review effective routes", "Review effective security rules", "Run a Network Watcher connection troubleshoot"],
    explanation:
      "Start with routing, then filtering, and then use end-to-end connection diagnostics if the problem is still unresolved.",
  }),
  choiceQuestion({
    id: "Q2077",
    domain: "D4",
    type: "hot-area",
    difficulty: "medium",
    company: "Fabrikam Services",
    scenario:
      "While creating a route in a route table, you need the route to send traffic to a firewall VM inside the virtual network without sending the traffic to the internet or a gateway.",
    stem: "Which next hop type should you select?",
    subtopic: "Configure and manage virtual networks in Azure",
    referenceTopic: "Configure user-defined routes",
    options: [
      option("A", "Virtual appliance", "Virtual appliance is the next hop type used for a firewall or NVA inside the VNet."),
      option("B", "Internet", "Internet sends traffic directly to the internet instead of your firewall appliance."),
      option("C", "None", "None drops the traffic instead of forwarding it."),
      option("D", "Virtual network gateway", "Virtual network gateway is used for VPN or ExpressRoute connectivity, not a firewall VM."),
    ],
    correctOptionId: "A",
    explanation:
      "Routes that steer traffic to an NVA use the Virtual appliance next hop type.",
  }),
  choiceQuestion({
    id: "Q2078",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Operations",
    scenario:
      "You need an alert when the Percentage CPU metric on a virtual machine stays above 80 percent for 10 minutes so the operations team can respond before user impact increases and without relying on a cost-based alert.",
    stem: "Which Azure Monitor feature should you use?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Set up alert rules in Azure Monitor",
    options: [
      option("A", "A metric alert rule", "Metric alerts evaluate platform metrics such as CPU and memory-related counters."),
      option("B", "A budget alert", "Budgets monitor cost rather than operational metrics."),
      option("C", "An Activity Log alert rule", "Activity Log alerts monitor control-plane events, not operational metrics like CPU."),
      option("D", "A management group", "Management groups do not perform telemetry evaluation."),
    ],
    correctOptionId: "A",
    explanation:
      "Metric alerts are the Azure Monitor feature used for threshold-based alerts on platform metrics such as CPU; Activity Log alerts are for control-plane events like resource creation/deletion, not for operational metrics.",
  }),
  choiceQuestion({
    id: "Q2079",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Blue Yonder Airlines",
    scenario:
      "You want to store Azure Monitor logs and query them later by using Kusto Query Language (KQL) while keeping the log search experience centralized and avoiding a separate database just for operational logs or custom log plumbing.",
    stem: "Which Azure resource should you use to keep the logs centralized without building a separate query store?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Configure log settings in Azure Monitor",
    options: [
      option("A", "A Log Analytics workspace", "Log Analytics workspaces store Azure Monitor logs for KQL querying and analysis."),
      option("B", "An Application Insights workspace", "Application Insights is specialized for app-level telemetry and diagnostics, not general Azure Monitor logs."),
      option("C", "Azure DNS", "Azure DNS resolves names and does not provide log storage or querying."),
      option("D", "Azure Bastion", "Bastion secures VM access and is unrelated to log storage."),
    ],
    correctOptionId: "A",
    explanation:
      "Log Analytics workspaces are the core data store for Azure Monitor logs and KQL-based analysis; Application Insights is for application-specific telemetry, not general operational logs.",
  }),
  choiceQuestion({
    id: "Q2080",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fourth Coffee",
    scenario:
      "An alert rule is correct, but notifications should be suppressed automatically during a planned maintenance window while leaving the underlying alert definition intact and without disabling the rule itself.",
    stem: "Which Azure Monitor feature should you configure?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Set up alert processing rules in Azure Monitor",
    options: [
      option("A", "An alert processing rule", "Alert processing rules can suppress or route notifications without changing the core alert logic."),
      option("B", "A route table", "Routing does not affect Azure Monitor alert delivery behavior."),
      option("C", "An application security group", "ASGs are networking constructs and do not alter alert notifications."),
      option("D", "A resource lock", "Locks do not control alert notification pipelines."),
    ],
    correctOptionId: "A",
    explanation:
      "Alert processing rules are specifically intended to adjust what happens to alerts after they fire, such as suppressing notifications during maintenance.",
  }),
  choiceQuestion({
    id: "Q2081",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Tailwind Traders",
    scenario:
      "Operations wants a guided monitoring experience for Azure virtual machines that includes performance and dependency insights while avoiding a custom dashboard build from scratch or a separate monitoring tool chain.",
    stem: "Which Azure Monitor feature should you enable to get those insights without building a custom monitoring stack?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Configure and interpret monitoring by using Azure Monitor Insights",
    options: [
      option("A", "VM insights", "VM insights provides curated monitoring for virtual machines, including performance and dependency data."),
      option("B", "Budget alerts", "Budget alerts provide cost notifications, not VM health and dependency insights."),
      option("C", "Azure Policy", "Policy evaluates compliance rather than providing curated VM telemetry experiences."),
      option("D", "Azure DNS", "Azure DNS does not monitor virtual machine performance."),
    ],
    correctOptionId: "A",
    explanation:
      "VM insights is the Azure Monitor capability built for deeper observability of virtual machine workloads.",
  }),
  choiceQuestion({
    id: "Q2082",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Southridge Video",
    scenario:
      "You need ongoing connectivity tests between two Azure endpoints and want to review the results over time without running ad hoc validation scripts every day.",
    stem: "Which Azure feature should you use?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Use Azure Network Watcher and Connection monitor",
    options: [
      option("A", "Connection Monitor", "Connection Monitor is designed for continuous network reachability checks and historical reporting."),
      option("B", "Azure Policy", "Policy does not test end-to-end network connectivity."),
      option("C", "Packet capture via Network Watcher", "Packet capture is a one-time diagnostic tool for analyzing traffic, not for ongoing recurring tests and reporting."),
      option("D", "A resource lock", "Locks do not provide connectivity tests."),
    ],
    correctOptionId: "A",
    explanation:
      "Connection Monitor is the correct Azure tool for recurring connectivity testing, historical trending, and alerting; packet capture is a one-time diagnostic tool, not for ongoing monitoring.",
  }),
  choiceQuestion({
    id: "Q2083",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Woodgrove Bank",
    scenario:
      "You want to protect Azure virtual machines by using Azure Backup and must start with the correct vault-based resource so the backup plan can be managed centrally.",
    stem: "Which Azure resource should you create first?",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Create a Recovery Services vault",
    options: [
      option("A", "A Recovery Services vault", "Azure VM backup is configured through a Recovery Services vault."),
      option("B", "A private DNS zone", "DNS zones do not store or manage backups."),
      option("C", "An application security group", "ASGs do not provide backup capabilities."),
      option("D", "A public load balancer", "Load balancers do not protect virtual machine data."),
    ],
    correctOptionId: "A",
    explanation:
      "Recovery Services vaults are the primary Azure resource used to configure and manage Azure VM backup.",
  }),
  choiceQuestion({
    id: "Q2084",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Contoso Retail",
    scenario:
      "A production Azure VM workload must fail over to a secondary region during a regional outage while keeping the primary workload protected and avoiding a manual rebuild after the outage. The recovery design must support orchestrated failover without depending on ad hoc scripting during the incident.",
    stem: "Which Azure service should you configure?",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Configure Azure Site Recovery for Azure resources",
    options: [
      option("A", "Azure Site Recovery", "Site Recovery replicates workloads and orchestrates failover to a secondary region."),
      option("B", "Azure Service Health", "Service Health reports events but does not replicate workloads."),
      option("C", "Azure Advisor", "Advisor provides recommendations and does not perform regional failover."),
      option("D", "Azure Policy", "Policy enforces rules and does not create disaster recovery replication."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Site Recovery is the Azure disaster recovery service used for VM replication and orchestrated failover.",
  }),
  multiSelectQuestion({
    id: "Q2085",
    domain: "D5",
    type: "multi-select",
    difficulty: "medium",
    company: "Litware Research",
    scenario:
      "When a log alert fires, the team wants to receive email notifications and trigger automation without wiring up separate custom code for every alert or changing the alert condition itself.",
    stem: "Which two Azure Monitor components must you configure to send notifications and trigger automation? Each correct answer presents part of the solution.",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Set up alert rules and action groups in Azure Monitor",
    options: [
      option("A", "An action group", "Action groups define the notification and automation actions for an alert."),
      option("B", "An alert rule", "The alert rule defines the condition that will fire and invoke the action group."),
      option("C", "A resource lock", "Locks do not send notifications or run automation."),
      option("D", "A route table", "Route tables do not participate in Azure Monitor alert processing."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "You need the alert rule to detect the condition and the action group to deliver notifications and invoke automation.",
  }),
  multiSelectQuestion({
    id: "Q2086",
    domain: "D5",
    type: "multi-select",
    difficulty: "hard",
    company: "Fabrikam Health",
    scenario:
      "A business-critical Azure VM must support regional disaster recovery through Azure Site Recovery while keeping the failover path ready for a real outage, avoiding manual rebuild steps during recovery, preserving the source VM until failover has been validated, and completing recovery without rebuilding infrastructure manually.",
    stem: "Which two actions should you take? Each correct answer presents part of the solution.",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Configure Azure Site Recovery for Azure resources",
    options: [
      option("A", "Create a Recovery Services vault", "Site Recovery uses a Recovery Services vault to manage replication metadata and failover orchestration."),
      option("B", "Enable replication for the virtual machine", "The virtual machine must replicate to the target region before failover is possible."),
      option("C", "Create a budget alert", "Budget alerts do not provide disaster recovery replication."),
      option("D", "Add a public load balancer", "A load balancer can be part of an application design but is not the core Site Recovery enablement step."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Regional VM disaster recovery with Azure Site Recovery requires a Recovery Services vault and replication enabled for the VM.",
  }),
  yesNoQuestion({
    id: "Q2087",
    domain: "D5",
    type: "yes-no",
    difficulty: "easy",
    company: "Adventure Works",
    scenario:
      "You are reviewing Azure Monitor concepts for a production support runbook, and the team must distinguish metrics, logs, and connectivity monitoring without mixing them up.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Interpret metrics and query logs in Azure Monitor",
    statements: [
      { id: "S1", text: "Metric alerts can evaluate near-real-time platform metrics.", answer: "Yes" },
      { id: "S2", text: "Log Analytics workspaces can store and query Azure Monitor logs by using KQL.", answer: "Yes" },
      { id: "S3", text: "Connection Monitor is used to configure Azure Backup retention settings.", answer: "No" },
    ],
    explanation:
      "Metric alerts evaluate metrics, Log Analytics stores and queries logs, and Connection Monitor is for network diagnostics rather than backup retention.",
  }),
  yesNoQuestion({
    id: "Q2088",
    domain: "D5",
    type: "yes-no",
    difficulty: "medium",
    company: "Wingtip Distribution",
    scenario:
      "You are validating backup and disaster recovery statements for a production readiness review, and the team must distinguish vault types, Azure VM backup prerequisites, and regional recovery behavior without confusing the services.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Create a Recovery Services vault and Azure Backup vault",
    statements: [
      { id: "S1", text: "Azure Site Recovery uses a Recovery Services vault.", answer: "Yes" },
      { id: "S2", text: "A Backup vault can be used for operational backup of Azure Blobs.", answer: "Yes" },
      { id: "S3", text: "Azure VM backup always requires Azure Arc-enabled servers.", answer: "No" },
    ],
    explanation:
      "Site Recovery relies on a Recovery Services vault, Backup vaults support newer workload types such as operational backup for Azure Blobs, and Azure VM backup does not depend on Azure Arc.",
  }),
  yesNoQuestion({
    id: "Q2089",
    domain: "D5",
    type: "yes-no",
    difficulty: "medium",
    company: "Nod Publishers",
    scenario:
      "You are reviewing alerting and disaster recovery statements for an operations runbook, and the design must let the team test recovery, suppress notifications, and surface backup reporting without changing alert detection logic.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Set up alert processing rules and configure reports and alerts for backups",
    statements: [
      { id: "S1", text: "A test failover in Azure Site Recovery can be run without interrupting ongoing replication.", answer: "Yes" },
      { id: "S2", text: "Alert processing rules change the query logic inside an alert rule.", answer: "No" },
      { id: "S3", text: "Azure Backup reports can be surfaced through Azure Monitor workbooks.", answer: "Yes" },
    ],
    explanation:
      "Test failover is designed to validate recovery without production cutover, alert processing rules change alert handling rather than detection logic, and Azure Backup reporting integrates with Azure Monitor workbooks.",
  }),
  dragDropQuestion({
    id: "Q2090",
    domain: "D5",
    type: "drag-drop",
    difficulty: "medium",
    company: "Humongous Insurance",
    scenario:
      "You are enabling Azure Backup for a virtual machine, and the onboarding process must follow the vault-first workflow so the policy and protection settings exist before the VM is added and before the first scheduled backup runs.",
    stem: "Arrange the actions in the correct order so the backup setup is valid and the VM can be protected without skipping prerequisites.",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Create and configure a backup policy and perform backup operations",
    availableItems: [
    "Create the Recovery Services vault",
    "Enable backup for the virtual machine",
    "Create or select the backup policy"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: ["Create the Recovery Services vault", "Create or select the backup policy", "Enable backup for the virtual machine"],
    explanation:
      "The vault must exist first, then the policy, and finally the VM can be onboarded for backup.",
  }),
  choiceQuestion({
    id: "Q2091",
    domain: "D1",
    type: "case-study",
    difficulty: "medium",
    company: "Contoso Retail Group",
    scenario:
      "Case study: The platform team must manage Azure Policy exemptions in the finance landing zone without receiving permission to assign RBAC roles, and the governance model must stay limited to policy administration at the management group scope.",
    stem: "Which role should you assign to the platform team at the management group scope?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Manage built-in Azure roles",
    caseStudyId: "CS-CONTOSO-RETAIL",
    options: [
      option("A", "Resource Policy Contributor", "This role is designed for policy management tasks such as managing policy assignments and exemptions without broader role assignment rights."),
      option("B", "Contributor", "Contributor is broader than necessary and is not the least-privileged policy-focused option."),
      option("C", "User Access Administrator", "This role manages access assignments rather than policy exemptions."),
      option("D", "Owner", "Owner includes full management and RBAC assignment rights, which exceed the requirement."),
    ],
    correctOptionId: "A",
    explanation:
      "Resource Policy Contributor is the least-privileged built-in role that aligns with policy administration without allowing RBAC role assignment.",
  }),
  choiceQuestion({
    id: "Q2092",
    domain: "D2",
    type: "case-study",
    difficulty: "medium",
    company: "Contoso Retail Group",
    scenario:
      "Case study: Retail transaction exports must remain readable from a secondary region during recovery drills while the primary workload continues to use a single storage account and the recovery team can verify the replica without a full failover.",
    stem: "Which storage redundancy option should you use?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Configure Azure Storage redundancy",
    caseStudyId: "CS-CONTOSO-RETAIL",
    options: [
      option("A", "GRS", "GRS replicates data to a secondary region but does not offer read access to that replica."),
      option("B", "RA-GRS", "RA-GRS provides geo-replication plus read access to the secondary region endpoint."),
      option("C", "ZRS", "ZRS protects only within the primary region."),
      option("D", "LRS", "LRS does not provide any secondary region copy."),
    ],
    correctOptionId: "B",
    explanation:
      "RA-GRS is the correct choice when data must be replicated to a secondary region and remain readable there.",
  }),
  choiceQuestion({
    id: "Q2093",
    domain: "D3",
    type: "case-study",
    difficulty: "medium",
    company: "Contoso Retail Group",
    scenario:
      "Case study: The public web tier must scale automatically across identical compute instances with minimal manual administration, and the team wants native autoscale rather than hand-managed VM cloning or manual load distribution.",
    stem: "Which Azure compute resource should you use to scale identical instances without managing VM cloning manually?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Deploy and configure an Azure Virtual Machine Scale Sets",
    caseStudyId: "CS-CONTOSO-RETAIL",
    options: [
      option("A", "An availability set", "Availability sets improve resiliency for a fixed set of VMs but do not provide built-in autoscale."),
      option("B", "A virtual machine scale set", "VM scale sets provide identical instances with native scale operations and autoscale support."),
      option("C", "A dedicated host", "Dedicated hosts allocate hardware and do not natively solve autoscale requirements."),
      option("D", "Azure Container Instances", "ACI is not the right fit for a VM-based web tier that must scale identical VM instances."),
    ],
    correctOptionId: "B",
    explanation:
      "Virtual machine scale sets are purpose-built for scaling identical VM instances with minimal administrative overhead.",
  }),
  choiceQuestion({
    id: "Q2094",
    domain: "D4",
    type: "case-study",
    difficulty: "medium",
    company: "Contoso Retail Group",
    scenario:
      "Case study: Private endpoints will be added for PaaS dependencies, and every spoke virtual network must resolve the service names correctly while keeping the private records aligned with the private endpoint IPs.",
    stem: "What should you deploy to support name resolution?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Configure private endpoints for Azure PaaS",
    caseStudyId: "CS-CONTOSO-RETAIL",
    options: [
      option("A", "A private DNS zone linked to the spoke virtual networks", "Private DNS zones provide the required internal name resolution for private endpoints."),
      option("B", "A public DNS zone only", "Public DNS alone does not resolve the private IP addresses used by private endpoints inside VNets."),
      option("C", "A route table", "Route tables control traffic flow and do not publish name records."),
      option("D", "An application security group", "ASGs are for NSG targeting and do not provide DNS services."),
    ],
    correctOptionId: "A",
    explanation:
      "Private endpoint deployments require the right private DNS zone and VNet links so consumers resolve the service FQDNs to private IP addresses.",
  }),
  choiceQuestion({
    id: "Q2095",
    domain: "D5",
    type: "case-study",
    difficulty: "medium",
    company: "Contoso Retail Group",
    scenario:
      "Case study: Production Azure virtual machines must support failover to a paired region during an outage, and the recovery plan must orchestrate replication and failover without relying on manual rebuild steps.",
    stem: "Which Azure service should you configure?",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Configure Azure Site Recovery for Azure resources",
    caseStudyId: "CS-CONTOSO-RETAIL",
    options: [
      option("A", "Azure Site Recovery", "Site Recovery provides replication and orchestrated regional failover for Azure VMs."),
      option("B", "Azure Update Manager", "Update Manager handles patching, not regional disaster recovery."),
      option("C", "Azure Advisor", "Advisor recommends improvements but does not perform failover."),
      option("D", "Azure Policy", "Policy enforces governance and does not replicate VMs."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Site Recovery is the appropriate Azure service for regional disaster recovery of virtual machines.",
  }),
  choiceQuestion({
    id: "Q2096",
    domain: "D1",
    type: "case-study",
    difficulty: "hard",
    company: "Fabrikam Health Services",
    scenario:
      "Case study: Support leads must invite external support engineers as guest users and place them into support groups, but they must not receive Azure subscription administration rights. The role assignment should cover guest and group management without opening broader Azure access.",
    stem: "Which Microsoft Entra role should you assign to the support leads?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Manage external users and groups",
    caseStudyId: "CS-FABRIKAM-HEALTH",
    options: [
      option("A", "Guest Inviter", "Guest Inviter can invite guests but does not provide the broader user and group management required here."),
      option("B", "Groups Administrator", "Groups Administrator manages groups but does not fully cover user object administration for guest accounts."),
      option("C", "User Administrator", "User Administrator can manage users, including guest accounts, and groups without granting Azure subscription administration rights."),
      option("D", "Billing Reader", "Billing Reader has no guest or group management capabilities."),
    ],
    correctOptionId: "C",
    explanation:
      "User Administrator is the best-fit built-in role for managing guest users and group membership without granting subscription-level Azure administration rights.",
  }),
  choiceQuestion({
    id: "Q2097",
    domain: "D2",
    type: "case-study",
    difficulty: "hard",
    company: "Fabrikam Health Services",
    scenario:
      "Case study: Departmental file shares are moving to Azure Files, and Windows users must continue to authenticate over SMB with their existing on-premises AD DS credentials while avoiding a separate cloud-only identity model.",
    stem: "What should you configure on the storage account?",
    subtopic: "Configure access to storage",
    referenceTopic: "Configure identity-based access for Azure Files",
    caseStudyId: "CS-FABRIKAM-HEALTH",
    options: [
      option("A", "Anonymous access", "Anonymous access does not support authenticated SMB access with existing domain credentials."),
      option("B", "Shared key access only", "Shared keys do not provide identity-based SMB authentication using AD DS credentials."),
      option("C", "AD DS authentication for Azure Files", "Azure Files can integrate with on-premises AD DS so users authenticate by using their existing domain identities."),
      option("D", "Public container access", "Public container access applies to blobs, not Azure Files SMB authentication."),
    ],
    correctOptionId: "C",
    explanation:
      "When users must access Azure Files over SMB by using existing on-premises AD DS identities, the storage account should be configured for AD DS authentication.",
  }),
  choiceQuestion({
    id: "Q2098",
    domain: "D3",
    type: "case-study",
    difficulty: "hard",
    company: "Fabrikam Health Services",
    scenario:
      "Case study: The new patient intake API must run in containers, needs managed HTTP ingress, supports revisions, and should scale to zero outside business hours while the operations team avoids managing a Kubernetes cluster, avoids rebuilding the app for every revision, keeps the deployment model fully managed, and deploys updates without cluster-operations overhead.",
    stem: "Which Azure service should you use for a managed container platform that meets those constraints?",
    subtopic: "Provision and manage containers in the Azure portal",
    referenceTopic: "Provision a container by using Azure Container Apps",
    caseStudyId: "CS-FABRIKAM-HEALTH",
    options: [
      option("A", "Azure Container Instances", "ACI can run containers, but it is not the best fit for revision-based HTTP apps with scale-to-zero requirements."),
      option("B", "Azure Virtual Machine Scale Sets", "VM scale sets manage VMs rather than providing a managed container application platform."),
      option("C", "Azure Container Apps", "Container Apps is designed for managed HTTP container apps that require revisions and scale-to-zero support."),
      option("D", "A dedicated host", "Dedicated hosts allocate hardware and do not provide managed container platform features."),
    ],
    correctOptionId: "C",
    explanation:
      "Azure Container Apps is the best match for revision-aware HTTP container workloads that must scale down when idle.",
  }),
  choiceQuestion({
    id: "Q2099",
    domain: "D4",
    type: "case-study",
    difficulty: "hard",
    company: "Fabrikam Health Services",
    scenario:
      "Case study: A managed data service must be reachable from the application subnet over a private IP only, must stay off the public internet, and must keep subnet-based access control intact while the security team avoids exposing the service through a public endpoint.",
    stem: "Which networking feature should you configure to meet those constraints?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Configure private endpoints for Azure PaaS",
    caseStudyId: "CS-FABRIKAM-HEALTH",
    options: [
      option("A", "A service endpoint", "Service endpoints keep the service on its public endpoint and do not provide a private IP in your VNet."),
      option("B", "A private endpoint", "A private endpoint places the service connection on a private IP inside the VNet and avoids public exposure."),
      option("C", "A public load balancer", "A public load balancer exposes services and does not privatize PaaS access."),
      option("D", "A NAT gateway", "A NAT gateway controls outbound internet translation and is unrelated to private PaaS ingress."),
    ],
    correctOptionId: "B",
    explanation:
      "Private endpoints are the correct Azure feature when a PaaS service must be reachable privately from a subnet and not exposed on the public internet.",
  }),
  choiceQuestion({
    id: "Q2100",
    domain: "D5",
    type: "case-study",
    difficulty: "hard",
    company: "Fabrikam Health Services",
    scenario:
      "Case study: Operations must have one central data store for log queries, alert rules, and analysis across the Azure environment, and the platform must support KQL-driven investigation without splitting logs across multiple ad hoc stores, without sending investigators to separate services for queries, and while keeping the workflow centralized.",
    stem: "Which Azure resource should be used as the central logging platform for that workflow?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Query and analyze logs in Azure Monitor",
    caseStudyId: "CS-FABRIKAM-HEALTH",
    options: [
      option("A", "The Activity Log", "The Activity Log captures control-plane events but is not the central long-term analytics workspace for all Azure Monitor logs."),
      option("B", "A Log Analytics workspace", "Log Analytics is Azure Monitor's data platform for KQL queries, alerting, and operational analysis."),
      option("C", "Azure Advisor", "Advisor recommends improvements and is not the primary log analytics store."),
      option("D", "Service Health", "Service Health reports Microsoft service issues and is not a general-purpose log analytics platform."),
    ],
    correctOptionId: "B",
    explanation:
      "A Log Analytics workspace is the correct central platform for Azure Monitor log collection, querying, and alert-driven operations.",
  }),
  ...additionalQuestions,
  ...finalPrepQuestions,
  ...april2026ExpansionQuestions,
  ...mayExpansionQuestions,
];

export const initialQuestionBank: QuestionBank = {
  version: BANK_VERSION,
  updatedAt: BANK_UPDATED_AT,
  questions: initialQuestions,
  caseStudies: initialCaseStudies,
};

export const createBundledQuestionBank = (): QuestionBank => structuredClone(initialQuestionBank);

import type {
  CaseStudy,
  ChoiceQuestion,
  DragDropQuestion,
  MultiSelectQuestion,
  Question,
  QuestionOption,
  YesNoQuestion,
} from "../types/exam";
import { rebalanceChoiceOptionIds } from "./rebalanceChoiceOptionIds.ts";

const complexityTargets = {
  easy: { minScenarioChars: 110, minStemChars: 28, minConstraintTokens: 1 },
  medium: { minScenarioChars: 150, minStemChars: 30, minConstraintTokens: 2 },
  hard: { minScenarioChars: 190, minStemChars: 32, minConstraintTokens: 3 },
};

const constraintTokenRegex = /must|without|while|only|minimum|minimize|least|cannot|required|ensure|prevent|unless/gi;
const tradeoffRegex = /while|without|minimize|least|at the same time|trade-?off|however|but/i;

type ComplexPrompt = {
  scenario: string;
  stem: string;
  difficulty: "easy" | "medium" | "hard";
};

const countConstraintTokens = (text: string): number => {
  const matches = text.match(constraintTokenRegex);
  return matches ? matches.length : 0;
};

const ensurePromptComplexity = <T extends ComplexPrompt>(question: T): T => {
  const target = complexityTargets[question.difficulty];
  let scenario = question.scenario.trim();
  let stem = question.stem.trim();

  if (scenario.length < target.minScenarioChars) {
    scenario = `${scenario} The implementation must ensure least-privilege access, prevent avoidable downtime, and meet minimum compliance requirements without broad exceptions.`;
  }

  if (countConstraintTokens(`${scenario} ${stem}`) < target.minConstraintTokens) {
    stem = `${stem} Choose the option that must ensure required controls, satisfy minimum compliance requirements, and prevent service impact while minimizing operational overhead without broad exceptions.`;
  }

  if (stem.length < target.minStemChars) {
    stem = `${stem} Consider governance, resiliency, and least-privilege boundaries.`;
  }

  if (question.difficulty === "hard" && !tradeoffRegex.test(`${scenario} ${stem}`)) {
    stem = `${stem} Select the best trade-off while minimizing complexity and cost impact.`;
  }

  return {
    ...question,
    scenario,
    stem,
  };
};

const option = (id: string, text: string, rationale: string): QuestionOption => ({
  id,
  text,
  rationale,
});

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

export const additionalCaseStudies: CaseStudy[] = [
  {
    id: "CS-ADATUM-FINANCE",
    companyName: "Adatum Financial Services",
    title: "Case Study: Secure subscription expansion for regulated trading workloads",
    overview:
      "Adatum Financial Services is expanding a regulated trading platform into a second Azure region. The platform team must keep administrator access time-bound, protect data paths, reduce public exposure, and streamline recovery operations.",
    currentEnvironment: [
      "Production and disaster recovery subscriptions reside under an Adatum-Prod management group.",
      "A line-of-business web application runs in Azure App Service and stores monthly regulatory exports in Azure Storage.",
      "Operations administrators currently hold permanent Contributor assignments on the production subscription.",
      "Application virtual machines run in a spoke virtual network without public IP addresses.",
      "Monitoring data from production resources is sent to a central Log Analytics workspace.",
    ],
    plannedChanges: [
      "Deploy the trading web app to an additional region by using a staging process that minimizes downtime.",
      "Allow administrators to elevate subscription access only when approved and only for a limited time.",
      "Store monthly regulatory exports in a storage account that remains readable from the secondary region.",
      "Provide secure RDP and SSH connectivity to application virtual machines without assigning public IP addresses.",
      "Centralize patch orchestration across Azure virtual machines.",
    ],
    requirements: [
      "Standing privileged access must be minimized.",
      "Regional storage outages must not block read access to regulatory exports.",
      "Application releases must support staging and controlled cutover.",
      "Administrative VM access must stay private.",
      "VM patching must be managed from a central Azure service.",
    ],
    questionIds: ["Q2122", "Q2139", "Q2163", "Q2184", "Q2199"],
  },
  {
    id: "CS-PROSEWARE-RESEARCH",
    companyName: "Proseware Research",
    title: "Case Study: Hybrid analytics platform and private service access",
    overview:
      "Proseware Research is modernizing a hybrid analytics environment in Azure. The company must extend branch connectivity, migrate shared data, run containerized APIs, and improve operational visibility while maintaining strict network controls.",
    currentEnvironment: [
      "Researchers authenticate with synchronized Microsoft Entra identities from on-premises Active Directory Domain Services.",
      "Department shares are hosted on Windows file servers in a headquarters datacenter and accessed from branch offices.",
      "A new analytics API is packaged as a container image and must process event-driven HTTP traffic.",
      "A data-processing subnet sends outbound traffic directly to the internet.",
      "Alerts are currently configured separately on individual resources and emailed directly to engineers.",
    ],
    plannedChanges: [
      "Delegate guest user and group administration for external researchers to helpdesk leads.",
      "Replace department file servers with Azure-based file shares while keeping branch office cache servers.",
      "Run the API on a fully managed service that supports revisions and scales to zero.",
      "Provide fixed outbound public IP addresses for the data-processing subnet.",
      "Standardize alert notifications and automation targets across the environment.",
    ],
    requirements: [
      "Helpdesk leads must manage guest users and research groups but must not manage Azure resources.",
      "File data must stay in Azure while branch offices can cache frequently used files locally.",
      "The API platform must require minimal infrastructure management.",
      "Outbound internet traffic from the processing subnet must use predictable public IP addresses.",
      "Alert notifications must be reusable across multiple alert rules.",
    ],
    questionIds: ["Q2123", "Q2140", "Q2164", "Q2185", "Q2200"],
  },
];

export const additionalQuestions: Question[] = [
  choiceQuestion({
    id: "Q2101",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Coho Vineyard",
    scenario:
      "Helpdesk staff in the Paris office must reset passwords and update profile details only for users who belong to the Paris office. Auditors must verify that access scope is narrowed to the Paris region and no global administrative access is granted.",
    stem: "Which Microsoft Entra object should you use to scope the delegated administration?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Administrative units in Microsoft Entra ID",

    hint: "Which Microsoft Entra object scopes delegated administration to a specific geographic boundary without granting full tenant-wide rights?",
    options: [
      option("A", "A Conditional Access policy", "Conditional Access controls sign-in behavior rather than delegated user administration scope."),
      option("B", "An administrative unit", "Administrative units scope directory administration to an organizational boundary (e.g., geographic region), enabling delegated management without tenant-wide access rights."),
      option("C", "A resource group", "Resource groups organize Azure resources and do not scope user administration."),
      option("D", "A management group", "Management groups scope Azure subscriptions, not Microsoft Entra directory objects."),
    ],
    correctOptionId: "B",
    explanation:
      "Administrative units scope directory administration to a specific organizational boundary (region, business unit), enabling delegated user password resets and profile updates without granting full tenant-wide administrative rights. This satisfies the audit requirement for narrowed scope.",
  }),
  choiceQuestion({
    id: "Q2102",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Lucerne Publishing",
    scenario:
      "All members of the Sales department need the same Microsoft 365 license package. New sales employees must receive the licenses automatically, and finance must be able to track licensing costs per department or business unit for chargeback purposes.",
    stem: "Which approach should you use?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Group-based licensing",

    hint: "Which approach automatically assigns the same license package to current and future members while enabling cost tracking by department?",
    options: [
      option("A", "Assign the licenses to a Microsoft Entra group", "Group-based licensing automatically applies licenses to current and future members and groups are typically organized by department for cost tracking."),
      option("B", "Create a budget at the subscription scope", "Budgets track cost and do not assign user licenses."),
      option("C", "Create a resource lock", "Resource locks protect Azure resources and do not affect user licensing."),
      option("D", "Use an NSG application security group", "Application security groups are networking constructs and unrelated to licensing."),
    ],
    correctOptionId: "A",
    explanation:
      "Group-based licensing is the standard way to assign the same licenses automatically to all current and future members of a group; organizing groups by department enables finance teams to track license costs per department for chargeback.",
  }),
  choiceQuestion({
    id: "Q2103",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Wide World Importers",
    scenario:
      "You need a group that automatically contains every user whose Department attribute is set to Finance, and the membership rule must update without manual adds or removals as HR updates user attributes.",
    stem: "Which type of group should you create?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Dynamic membership rules",

    hint: "Which group type uses user attributes in a rule and automatically updates membership as HR changes employee data?",
    options: [
      option("A", "A dynamic user group", "Dynamic user groups evaluate user attributes and update membership automatically."),
      option("B", "A mail-enabled security group", "Mail-enabled security groups do not use attribute-based membership rules by themselves."),
      option("C", "A static security group", "Static groups require manual membership updates."),
      option("D", "An administrative unit", "Administrative units scope administration and do not provide group membership automation."),
    ],
    correctOptionId: "A",
    explanation:
      "A dynamic user group uses a membership rule based on user attributes such as Department, so membership stays current automatically.",
  }),
  choiceQuestion({
    id: "Q2104",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Graphic Design Institute",
    scenario:
      "You are creating a custom Azure role that must be assignable in every subscription under the Corp-Prod management group, and the definition must be reusable by child subscriptions without recreating it in each one.",
    stem: "At which scope should you create the custom role definition?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Create custom Azure RBAC roles",

    hint: "At which scope should you create the custom role so child subscriptions can use it without recreating the definition in each one?",
    options: [
      option("A", "At the Corp-Prod management group", "Creating the role at the management group lets child subscriptions use the role definition."),
      option("B", "At one resource group in each subscription", "A resource-group-scoped role definition cannot be reused subscription-wide."),
      option("C", "At a single child subscription only", "A subscription-scoped custom role does not automatically exist in sibling subscriptions."),
      option("D", "At an availability set", "Availability sets are compute resources and cannot hold RBAC role definitions."),
    ],
    correctOptionId: "A",
    explanation:
      "Custom roles should be created at the highest scope where they need to exist. Creating the role at the management group makes it available to child subscriptions.",
  }),
  choiceQuestion({
    id: "Q2105",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Southridge Video",
    scenario:
      "An auditor must have read-only access to all current and future subscriptions under the Audit management group, and the assignment must flow down automatically as new subscriptions are added.",
    stem: "Where should you assign the Reader role?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Scope access assignments",

    hint: "At which scope should you assign a role so the assignment flows down automatically to all child subscriptions, including future ones?",
    options: [
      option("A", "At an administrative unit", "Administrative units do not scope Azure resource access."),
      option("B", "At the Audit management group", "Assignments at a management group are inherited by child subscriptions."),
      option("C", "At one storage account", "That scope is too narrow and does not cover all subscriptions."),
      option("D", "At each resource group", "This would require manual assignments and would not cover future subscriptions automatically."),
    ],
    correctOptionId: "B",
    explanation:
      "Assigning Reader at the management group scope is the correct way to provide inherited read-only access to all child subscriptions.",
  }),
  choiceQuestion({
    id: "Q2106",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "A. Datum Travel",
    scenario:
      "You need to deploy one governance object that groups together several Azure Policy definitions for a production landing zone, so the platform team can assign and maintain them as a single package without creating separate assignments for every individual policy or duplicating the same settings across subscriptions.",
    stem: "Which Azure Policy object should you create to package multiple policy definitions without assigning them one by one?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Policy initiatives",

    hint: "Which Azure Policy construct groups multiple policy definitions together so they can be assigned as a single package?",
    options: [
      option("A", "An initiative definition", "An initiative groups multiple policy definitions so they can be assigned together."),
      option("B", "A resource lock", "Resource locks protect resources from change or deletion but do not group policies."),
      option("C", "A budget", "Budgets track cost and do not package policy definitions."),
      option("D", "An action group", "Action groups are used by alerts, not Azure Policy."),
    ],
    correctOptionId: "A",
    explanation:
      "An initiative definition is the Azure Policy construct used to group several policy definitions into a single assignable package.",
  }),
  choiceQuestion({
    id: "Q2107",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Research",
    scenario:
      "All resources deployed into resource groups must inherit the CostCenter tag value from the resource group if the tag is missing, and the policy must fix noncompliant deployments instead of merely reporting them.",
    stem: "Which Azure Policy effect should you use?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Policy effects",

    hint: "Which Azure Policy effect can add or correct tag values on resources during both deployment and remediation?",
    options: [
      option("A", "Modify", "Modify can add or update tags on resources during deployment and remediation."),
      option("B", "Audit", "Audit records noncompliance but does not change resource properties."),
      option("C", "Disabled", "Disabled prevents policy evaluation entirely."),
      option("D", "Deny", "Deny blocks noncompliant deployments instead of fixing tag values automatically."),
    ],
    correctOptionId: "A",
    explanation:
      "The Modify effect is used when Azure Policy must add or correct tag values on resources automatically.",
  }),
  choiceQuestion({
    id: "Q2108",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Tailwind Medical",
    scenario:
      "A vendor-managed application deployed resources into your subscription, and Contributors still cannot delete one managed resource even after the team removed locks and confirmed the RBAC role is in place. The operations team must keep the deletion blocked by an authorization decision that survives the lock cleanup while still allowing normal Contributor access to the other resources.",
    stem: "Which Azure construct is most likely preventing the deletion?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Deny assignments",

    hint: "Which Azure construct can block resource deletion even when RBAC permissions would otherwise allow it, and persists even after locks are removed?",
    options: [
      option("A", "A deny assignment", "Deny assignments can block actions even when RBAC permissions would otherwise allow them."),
      option("B", "A budget alert", "Budget alerts do not block resource operations."),
      option("C", "A diagnostic setting", "Diagnostic settings send logs and metrics but do not enforce access decisions."),
      option("D", "An action group", "Action groups are alert targets and do not prevent deletion."),
    ],
    correctOptionId: "A",
    explanation:
      "Deny assignments are used by some managed solutions to block certain operations regardless of RBAC assignments such as Contributor.",
  }),
  choiceQuestion({
    id: "Q2109",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Wingtip Toys",
    scenario:
      "A CanNotDelete lock is applied to the RG-App resource group, and the operations team needs to know whether routine updates are still allowed while accidental deletion is blocked.",
    stem: "What is the effect on resources inside RG-App?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Resource locks",

    hint: "Does a CanNotDelete lock allow routine updates while only blocking deletion, or does it make resources read-only?",
    options: [
      option("A", "Resources in RG-App cannot be deleted until the lock is removed", "A CanNotDelete lock inherited from the resource group prevents deletion of child resources."),
      option("B", "Resources in RG-App become read-only", "Read-only behavior requires a ReadOnly lock, not CanNotDelete."),
      option("C", "Only new resources inherit the lock", "Existing and new child resources are protected by the resource-group-level lock."),
      option("D", "The lock affects only the resource group object and not its resources", "Resource locks at a resource group scope affect resources in that group."),
    ],
    correctOptionId: "A",
    explanation:
      "A CanNotDelete lock on a resource group prevents deletion of the resource group and of resources inside it, while still allowing updates.",
  }),
  choiceQuestion({
    id: "Q2110",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Nod Publishers",
    scenario:
      "You must notify the finance team when subscription spending reaches 80 percent of the monthly budget amount to prevent overages, and the alert must be informational rather than a deployment control. Operations must still be able to override the budget during critical incidents without breaking deployments.",
    stem: "Which Azure feature should you configure?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Configure budgets and alerts",

    hint: "Which feature sends threshold-based cost alerts to notify the team without blocking deployments?",
    options: [
      option("A", "Cost analysis with manual approval gates", "Manual approval processes can gate costs but do not provide automatic threshold-based alerting."),
      option("B", "A resource lock", "Locks protect resources but do not monitor spend."),
      option("C", "A budget with an alert threshold", "Budgets can send alerts when forecasted or actual spend crosses thresholds without blocking operations; still allows emergency overrides."),
      option("D", "A virtual network gateway", "Virtual network gateways provide connectivity, not cost alerts."),
    ],
    correctOptionId: "C",
    explanation:
      "Azure Cost Management budgets support threshold-based alerting for actual and forecasted subscription spend and provide notifications that inform without blocking deployments, allowing operations to override during critical incidents.",
  }),
  choiceQuestion({
    id: "Q2111",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Adatum Legal",
    scenario:
      "An Azure Automation account must access Azure resources without storing secrets or certificates, and the identity must be managed by Azure rather than by an embedded credential store.",
    stem: "Which identity type should the automation account use?",
    subtopic: "Manage Azure identities and governance",
    referenceTopic: "Managed identities for Azure resources",

    hint: "Which identity type lets Azure workloads authenticate without storing secrets in code, configuration, or a credential store?",
    options: [
      option("A", "A managed identity", "Managed identities let Azure workloads authenticate without storing credentials in code or configuration."),
      option("B", "A shared access key (SAS)", "SAS tokens are account-level secrets that must be stored and rotated, not suitable for workload identity."),
      option("C", "A resource lock", "Resource locks do not provide authentication."),
      option("D", "A budget", "Budgets are used for cost tracking and alerting, not authentication."),
    ],
    correctOptionId: "A",
    explanation:
      "Managed identities are designed for Azure resources such as Automation accounts to obtain tokens without embedded secrets; they replace key/SAS-based authentication by using Azure-managed credentials.",
  }),
  choiceQuestion({
    id: "Q2112",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Fourth Coffee",
    scenario:
      "A platform lead must create and remove Azure role assignments but must not be allowed to create, modify, or delete resources, so the role must manage access without broad resource permissions.",
    stem: "Which built-in Azure role should you assign?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Built-in Azure RBAC roles",

    hint: "Which built-in Azure role allows managing RBAC role assignments without granting general resource creation or deletion rights?",
    options: [
      option("A", "Reader", "Reader cannot create or remove role assignments."),
      option("B", "Contributor", "Contributor can manage resources, which exceeds the requirement."),
      option("C", "Virtual Machine Contributor", "This role manages VMs rather than RBAC assignments."),
      option("D", "User Access Administrator", "This role manages access to Azure resources without granting general resource management rights."),
    ],
    correctOptionId: "D",
    explanation:
      "User Access Administrator is the least-privileged built-in Azure role for managing RBAC role assignments without broader resource management.",
  }),
  multiSelectQuestion({
    id: "Q2113",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "Contoso Finance",
    scenario:
      "A governance initiative must automatically add required tags when possible and block deployments that use disallowed locations, while keeping the policy maintainable for multiple subscriptions in the same landing zone.",
    stem: "Which two Azure Policy effects should you use to enforce those requirements?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Policy effects",

    hint: "Which two Azure Policy effects work together to add required tags and block noncompliant deployments simultaneously?",
    options: [
      option("A", "Modify", "Modify can add or correct metadata such as tags during deployment or remediation."),
      option("B", "Deny", "Deny blocks noncompliant deployments such as disallowed locations."),
      option("C", "Disabled", "Disabled prevents evaluation instead of enforcing requirements."),
      option("D", "Manual", "Manual is not an Azure Policy effect."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Modify is used to add or change allowed metadata such as tags, while Deny blocks deployments that violate hard requirements such as location restrictions.",
  }),
  multiSelectQuestion({
    id: "Q2114",
    domain: "D1",
    type: "multi-select",
    difficulty: "hard",
    company: "Northwind Health",
    scenario:
      "Security requires administrators to have no standing privilege, but they must be able to elevate only when needed and every activation request must wait for manager approval before the role becomes active while still supporting just-in-time access.",
    stem: "Which two Privileged Identity Management configurations meet the requirement while keeping access just-in-time?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Microsoft Entra Privileged Identity Management",

    hint: "Which two PIM configurations eliminate standing privilege while requiring approval before elevated access becomes active?",
    options: [
      option("A", "Configure the role assignment as eligible", "Eligible assignments remove standing access and require activation when needed."),
      option("B", "Require approval to activate the role", "Approval can be enforced during PIM activation workflows."),
      option("C", "Create a read-only resource lock", "Resource locks do not control privileged role activation workflows."),
      option("D", "Create an Azure budget", "Budgets are unrelated to privileged access governance."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "PIM eligible assignments eliminate standing privilege, and approval requirements ensure elevated access is activated only after review.",
  }),
  multiSelectQuestion({
    id: "Q2115",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "Woodgrove Insurance",
    scenario:
      "One delegated admin must invite external partners. A different delegated admin must manage group memberships. Neither admin should receive subscription-level Azure access, and both tasks should stay within directory administration only.",
    stem: "Which two Microsoft Entra roles should you assign to keep the delegation narrow?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Built-in Microsoft Entra roles",

    hint: "Which two Microsoft Entra roles handle guest invitations and group membership management without granting subscription-level Azure admin rights?",
    options: [
      option("A", "Guest Inviter", "Guest Inviter is designed for inviting external users without broader Azure administration rights."),
      option("B", "Groups Administrator", "Groups Administrator can create and manage groups and their membership."),
      option("C", "Owner", "Owner grants broad Azure resource control and is unrelated to the delegated directory tasks."),
      option("D", "Billing Reader", "Billing Reader cannot invite guests or manage groups."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Guest Inviter handles guest invitations, and Groups Administrator covers group creation and membership management without Azure resource administration.",
  }),
  yesNoQuestion({
    id: "Q2116",
    domain: "D1",
    type: "yes-no",
    difficulty: "easy",
    company: "Alpine Ski House",
    scenario:
      "You are reviewing Azure governance statements for a subscription rollout that must preserve inherited control from the management group while still allowing budget alerts and locks to operate at the right scope.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Management groups, locks, and budgets",

    hint: "Test your knowledge: Do management group assignments inherit? Does CanNotDelete block reads? Can budgets trigger alerts?",
    statements: [
      {
        id: "S1",
        text: "A role assignment at a management group can be inherited by child subscriptions.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "A CanNotDelete lock prevents users from reading a resource.",
        answer: "No",
      },
      {
        id: "S3",
        text: "An Azure budget can trigger alerts when a threshold is reached.",
        answer: "Yes",
      },
    ],
    explanation:
      "Management-group assignments inherit downward, CanNotDelete blocks deletion but not reads, and budgets support threshold-based alerts.",
  }),
  yesNoQuestion({
    id: "Q2117",
    domain: "D1",
    type: "yes-no",
    difficulty: "medium",
    company: "City Power and Light",
    scenario:
      "You are validating access governance statements for a landing zone review, and the team must distinguish denial behavior, policy packaging, and just-in-time access without conflating them.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Deny assignments, initiatives, and PIM",

    hint: "Distinguish between these: Can deny assignments override Contributor? Can initiatives contain multiple policies? Do PIM eligible roles grant permanent access?",
    statements: [
      {
        id: "S1",
        text: "A deny assignment can block an action even if a user is assigned the Contributor role.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "An initiative definition can contain multiple Azure Policy definitions.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "A Privileged Identity Management eligible assignment grants permanent access until it is manually removed.",
        answer: "No",
      },
    ],
    explanation:
      "Deny assignments can override otherwise granted access, initiatives group multiple policies, and eligible roles require activation rather than granting permanent standing access.",
  }),
  yesNoQuestion({
    id: "Q2118",
    domain: "D1",
    type: "yes-no",
    difficulty: "medium",
    company: "Litware Education",
    scenario:
      "You are reviewing Microsoft Entra administration statements for a tenant operations review, and the team must scope administration to groups and directory subsets without granting broad Azure resource control.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Dynamic groups and delegated administration",

    hint: "Verify these concepts: Do dynamic groups use attribute rules? Can admin units scope directory admin? Can User Access Administrator create resources?",
    statements: [
      {
        id: "S1",
        text: "A dynamic group can use user attributes in a membership rule.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "Administrative units can be used to scope user administration to a subset of directory objects.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "The User Access Administrator role can create and manage any Azure resource.",
        answer: "No",
      },
    ],
    explanation:
      "Dynamic membership rules evaluate attributes, administrative units scope directory administration, and User Access Administrator manages access assignments rather than general resource operations.",
  }),
  dragDropQuestion({
    id: "Q2119",
    domain: "D1",
    type: "drag-drop",
    difficulty: "medium",
    company: "Humongous Insurance",
    scenario:
      "You are onboarding a subscription into a governed landing zone that uses a dedicated management group and policy initiative, and the process must preserve inheritance without skipping the hierarchy setup.",
    stem: "Arrange the actions in the correct order so governance can inherit properly.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Management groups and policy assignment",

    hint: "For governance to inherit properly, in which order must you: create the management group, place the subscription, and assign policies?",
    availableItems: [
    "Create the management group",
    "Move the subscription into the management group",
    "Assign the policy initiative at the management group scope"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: [
      "Create the management group",
      "Move the subscription into the management group",
      "Assign the policy initiative at the management group scope",
    ],
    explanation:
      "Create the management group first, place the subscription under it, and then assign the initiative where it can inherit to the subscription.",
  }),
  dragDropQuestion({
    id: "Q2120",
    domain: "D1",
    type: "drag-drop",
    difficulty: "medium",
    company: "A. Datum Travel",
    scenario:
      "You are creating a reusable custom Azure role for several subscriptions under the same management group. The role definition must be scope-safe before anyone assigns it, and the management group must be included as an assignable scope before the first delegation is made so the assignment path stays controlled.",
    stem: "Arrange the actions in the correct order so the role definition is valid at the management-group scope before assignment.",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Create custom Azure RBAC roles",

    hint: "For a custom role to be valid at the management group scope before assignment, what is the correct sequence: define actions, set scope, create, assign?",
    availableItems: [
    "Set the management group as an assignable scope",
    "Define the allowed actions in the role JSON",
    "Assign the custom role to the target group",
    "Create the custom role definition"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Define the allowed actions in the role JSON",
      "Set the management group as an assignable scope",
      "Create the custom role definition",
      "Assign the custom role to the target group",
    ],
    explanation:
      "You define the role permissions and assignable scopes before creating the role definition, and only then can you assign the role.",
  }),
  choiceQuestion({
    id: "Q2121",
    domain: "D1",
    type: "hot-area",
    difficulty: "hard",
    company: "Contoso Manufacturing",
    scenario:
      "Contoso has a root management group with child management groups named Prod and Dev. A policy must apply only to all production subscriptions while leaving development subscriptions untouched, and the assignment should stay as narrow as possible without affecting Dev.",
    stem: "At which scope should you assign the policy if you need inheritance for Prod but not Dev?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Policy scopes",

    hint: "If a policy must affect ONLY production subscriptions under Prod but not Dev, at which scope should you assign it?",
    options: [
      option("A", "The tenant root management group", "This would also affect Dev because both management groups inherit from the root."),
      option("B", "The Prod management group", "Assigning at Prod applies the policy to all child subscriptions in production only."),
      option("C", "One production resource group", "This scope is too narrow and would not cover all production subscriptions."),
      option("D", "The Dev management group", "This would affect the wrong environment."),
    ],
    correctOptionId: "B",
    explanation:
      "Assign the policy at the Prod management group so only production subscriptions inherit the requirement.",
  }),
  choiceQuestion({
    id: "Q2122",
    domain: "D1",
    type: "case-study",
    difficulty: "medium",
    company: "Adatum Financial Services",
    scenario:
      "Case study: Operations administrators must elevate subscription access only when approved and only for a limited time, while day-to-day access remains eligible rather than standing. The governance team wants approval-based activation without broadening RBAC scope.",
    stem: "Which feature should you configure to support approved, time-bound elevation?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Microsoft Entra Privileged Identity Management",

    hint: "Which service supports eligible, time-bound, approval-based role activation for Azure resource roles?",
    caseStudyId: "CS-ADATUM-FINANCE",
    options: [
      option("A", "Microsoft Entra Privileged Identity Management for Azure resource roles", "PIM provides eligible, time-bound activation workflows for Azure roles."),
      option("B", "A resource lock", "Locks protect resources but do not provide just-in-time privileged access."),
      option("C", "A management group", "Management groups organize scope but do not provide approval-based elevation."),
      option("D", "An action group", "Action groups are used by alerts and do not manage administrator elevation."),
    ],
    correctOptionId: "A",
    explanation:
      "PIM for Azure resource roles is the correct service when administrators must activate eligible role assignments only when needed and with approval controls.",
  }),
  choiceQuestion({
    id: "Q2123",
    domain: "D1",
    type: "case-study",
    difficulty: "medium",
    company: "Proseware Research",
    scenario:
      "Case study: Helpdesk leads must manage guest users and research groups but must not manage Azure resources, and the delegation should remain inside Microsoft Entra rather than subscription RBAC.",
    stem: "Which Microsoft Entra role should you assign to the helpdesk leads?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Built-in Microsoft Entra roles",

    hint: "Which Microsoft Entra role allows managing guest users and groups without granting subscription-level Azure resource access?",
    caseStudyId: "CS-PROSEWARE-RESEARCH",
    options: [
      option("A", "User Administrator", "User Administrator can manage users, including guests, and groups without granting Azure resource administration."),
      option("B", "Billing Reader", "Billing Reader cannot manage guests or groups."),
      option("C", "Contributor", "Contributor is an Azure RBAC role and manages resources, which is outside the requirement."),
      option("D", "Virtual Machine Contributor", "This role is unrelated to Microsoft Entra user and group administration."),
    ],
    correctOptionId: "A",
    explanation:
      "User Administrator is the best fit because it allows management of guest users and group membership without subscription-level Azure administration.",
  }),

  choiceQuestion({
    id: "Q2124",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Fabrikam Media",
    scenario:
      "A developer needs temporary write access to blobs in one container by using Microsoft Entra authentication instead of storage account keys, and the access token must be signed from an Entra-based identity flow.",
    stem: "Which type of shared access signature should you generate?",
    subtopic: "Configure access to storage",
    referenceTopic: "User delegation SAS",

    hint: "When SAS access must use Microsoft Entra credentials instead of storage account keys, which SAS type should you generate?",
    options: [
      option("A", "A user delegation SAS", "A user delegation SAS is signed by a user delegation key and uses Microsoft Entra credentials."),
      option("B", "An account SAS signed with the storage key", "Account SAS uses account keys rather than Microsoft Entra authorization."),
      option("C", "A service endpoint", "Service endpoints control network access and are not authorization tokens."),
      option("D", "A private endpoint", "Private endpoints provide private connectivity and do not replace SAS tokens."),
    ],
    correctOptionId: "A",
    explanation:
      "A user delegation SAS is the correct choice when SAS access must be derived from Microsoft Entra authentication instead of storage account keys.",
  }),
  choiceQuestion({
    id: "Q2125",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Northwind Traders",
    scenario:
      "Blob data that has not been accessed for 30 days must move automatically to a lower-cost tier while the team avoids manual re-tiering after every archive cycle.",
    stem: "Which Azure Storage feature should you use?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Lifecycle management",

    hint: "Which Azure Storage feature automatically transitions blobs between tiers based on access patterns and time?",
    options: [
      option("A", "Lifecycle management rules", "Lifecycle management moves blobs between tiers automatically based on age or other criteria."),
      option("B", "A resource lock", "Locks do not change blob access tiers."),
      option("C", "An NSG", "Network security groups do not manage blob tiers."),
      option("D", "A load balancer", "Load balancers are unrelated to storage tiering."),
    ],
    correctOptionId: "A",
    explanation:
      "Lifecycle management rules are designed to transition blobs between hot, cool, and archive tiers automatically.",
  }),
  choiceQuestion({
    id: "Q2126",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Graphic Design Institute",
    scenario:
      "Design documents in blob storage are sometimes overwritten by mistake, and you must be able to restore an earlier version of a blob after an overwrite while preserving the current blob for rollback comparisons.",
    stem: "Which storage feature should you enable?",
    subtopic: "Configure data protection for storage",
    referenceTopic: "Blob versioning",

    hint: "Which Azure Storage feature preserves earlier blob versions automatically when a blob is updated or overwritten?",
    options: [
      option("A", "Blob versioning", "Blob versioning preserves earlier versions when a blob is changed or overwritten."),
      option("B", "A public endpoint", "A public endpoint affects connectivity and does not preserve previous blob contents."),
      option("C", "An availability set", "Availability sets apply to VMs, not blobs."),
      option("D", "A NAT gateway", "NAT gateways manage outbound network translation, not blob recovery."),
    ],
    correctOptionId: "A",
    explanation:
      "Blob versioning is the correct feature when you need to retain and restore earlier blob states after updates or overwrites.",
  }),
  choiceQuestion({
    id: "Q2127",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Tailwind Traders",
    scenario:
      "A storage account must reject requests that use unencrypted HTTP to comply with data security audit standards. Existing scripts and integrations currently use HTTP, so the team needs time to migrate gradually without breaking deployments immediately.",
    stem: "Which storage account setting should you configure?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Secure transfer required",

    hint: "Which storage account setting forces clients to use HTTPS instead of HTTP and allows gradual migration from existing integrations?",
    options: [
      option("A", "Blob versioning", "Versioning preserves prior blob states but does not enforce transport encryption."),
      option("B", "Secure transfer required", "This setting forces clients to use HTTPS instead of HTTP; works gradually as clients update their connections."),
      option("C", "Zone-redundant storage", "Redundancy settings affect durability, not transport security."),
      option("D", "Azure Files identity-based authentication", "Azure Files authentication is unrelated to blocking HTTP access."),
    ],
    correctOptionId: "B",
    explanation:
      "Secure transfer required enforces HTTPS-only access to the storage account endpoints; when enabled, existing HTTP connections will fail and must be updated by clients, which allows a phased migration approach.",
  }),
  choiceQuestion({
    id: "Q2128",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum Supply",
    scenario:
      "A storage account must remain resilient to zone failures in the primary region and must also provide read access to the secondary region replica while keeping the workload available for validation during a regional outage.",
    stem: "Which redundancy option should you choose if you need both zone resiliency and secondary-region read access?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Storage redundancy options",

    hint: "Which storage redundancy option combines zone resilience in the primary region with read access in the secondary region?",
    options: [
      option("A", "RA-GZRS", "RA-GZRS combines zone redundancy in the primary region with read access to the geo-replicated secondary region."),
      option("B", "ZRS", "ZRS provides zone resilience only within the primary region and no secondary-region read access."),
      option("C", "GRS", "GRS replicates to a secondary region but does not provide read access to that replica."),
      option("D", "LRS", "LRS stores copies in one primary region only."),
    ],
    correctOptionId: "A",
    explanation:
      "RA-GZRS is the storage redundancy option that meets both requirements: zone-level resilience in the primary region and read access in the secondary region.",
  }),
  choiceQuestion({
    id: "Q2129",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Woodgrove Bank",
    scenario:
      "Regulatory documents stored in Azure Blob Storage must remain write-once, read-many for seven years while auditors can review them later and the team cannot alter them before retention expires.",
    stem: "Which feature should you configure?",
    subtopic: "Configure data protection for storage",
    referenceTopic: "Immutable blob storage",

    hint: "Which Azure Storage feature enforces write-once, read-many retention for regulatory compliance periods?",
    options: [
      option("A", "A time-based immutability policy", "Time-based immutability enforces WORM retention for a defined retention period."),
      option("B", "A virtual network gateway", "Gateways provide connectivity and do not enforce WORM retention."),
      option("C", "Blob soft delete", "Soft delete supports recovery but does not provide regulatory WORM retention."),
      option("D", "A load balancer", "Load balancers do not apply data-retention controls."),
    ],
    correctOptionId: "A",
    explanation:
      "A time-based immutability policy is the Azure Storage feature used to implement WORM retention for regulatory blobs.",
  }),
  choiceQuestion({
    id: "Q2130",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Proseware Retail",
    scenario:
      "Block blobs must be copied asynchronously from one storage account to another whenever new blobs are written to a source container, while the destination stays in sync for disaster recovery reporting.",
    stem: "Which Azure Storage feature should you use?",
    subtopic: "Configure data protection for storage",
    referenceTopic: "Object replication",

    hint: "Which Azure Storage feature asynchronously replicates block blobs from a source container to a destination storage account?",
    options: [
      option("A", "A backup vault", "Backup vaults are not used for block-blob replication between storage accounts."),
      option("B", "A resource lock", "Locks do not replicate blob data."),
      option("C", "Object replication", "Object replication asynchronously copies block blobs between source and destination storage accounts."),
      option("D", "A site-to-site VPN", "VPN gateways provide connectivity and do not replicate storage objects."),
    ],
    correctOptionId: "C",
    explanation:
      "Object replication is the correct Azure Storage capability for asynchronous block-blob replication between storage accounts.",
  }),
  choiceQuestion({
    id: "Q2131",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Fourth Coffee",
    scenario:
      "A storage account must prevent anonymous access to blob containers even when users try to browse the endpoint directly. Some specific containers do hold public data that should be accessible with shared access tokens, so you need granular control rather than account-level blocking.",
    stem: "Which storage account setting should you disable?",
    subtopic: "Configure access to storage",
    referenceTopic: "Anonymous blob access",

    hint: "Which account-level setting, when disabled, prevents anonymous public browsing while still allowing SAS-based container access?",
    options: [
      option("A", "Object replication", "Object replication asynchronously copies blobs between accounts for disaster recovery."),
      option("B", "Secure transfer required", "This setting enforces HTTPS but does not specifically disable anonymous access."),
      option("C", "Infrastructure encryption", "Infrastructure encryption is unrelated to anonymous blob access."),
      option("D", "Allow Blob anonymous access", "Disabling this setting blocks anonymous public access at the account level while still allowing SAS-based container access for specific scenarios."),
    ],
    correctOptionId: "D",
    explanation:
      "Disable Allow Blob anonymous access when blob containers must not be accessible anonymously; this account-level control prevents anonymous browsing while still allowing container-level SAS grants for specific public data containers.",
  }),
  choiceQuestion({
    id: "Q2132",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Litware Research",
    scenario:
      "A partner organization must upload files to Azure Storage by using SFTP on port 22 while the storage account remains a Blob Storage account and the team avoids deploying a separate transfer server.",
    stem: "Which storage account capability must you enable?",
    subtopic: "Configure access to storage",
    referenceTopic: "SFTP support for Azure Blob Storage",

    hint: "Which storage account feature, when enabled, allows SFTP protocol access on port 22 for Azure Blob Storage?",
    options: [
      option("A", "Hierarchical namespace", "SFTP support for Azure Blob Storage requires a storage account with hierarchical namespace enabled."),
      option("B", "Shared key access only", "Shared key usage is not the enabling capability for SFTP support."),
      option("C", "A Recovery Services vault", "A Recovery Services vault does not enable file transfer protocols."),
      option("D", "An availability set", "Availability sets apply to virtual machines, not storage accounts."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Blob Storage SFTP support requires a storage account with hierarchical namespace enabled.",
  }),
  multiSelectQuestion({
    id: "Q2133",
    domain: "D2",
    type: "multi-select",
    difficulty: "medium",
    company: "Contoso Retail",
    scenario:
      "Blob data is frequently deleted or overwritten accidentally, and you must be able to recover deleted blobs and restore earlier blob contents while keeping recovery points available for the support team.",
    stem: "Which two storage features should you enable?",
    subtopic: "Configure data protection for storage",
    referenceTopic: "Blob soft delete and versioning",

    hint: "Which two features together protect against accidental deletion and overwrite: one recovers deleted blobs, the other restores earlier versions?",
    options: [
      option("A", "Blob soft delete", "Blob soft delete protects against accidental deletion of blobs."),
      option("B", "Blob versioning", "Blob versioning preserves earlier blob contents when blobs are updated or overwritten."),
      option("C", "A site-to-site VPN", "VPN connectivity does not provide blob recovery features."),
      option("D", "A resource lock", "Locks do not preserve prior blob versions or recover deleted blobs."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Blob soft delete protects deleted blobs, while blob versioning provides recovery points for overwritten content.",
  }),
  multiSelectQuestion({
    id: "Q2134",
    domain: "D2",
    type: "multi-select",
    difficulty: "hard",
    company: "Fabrikam Health",
    scenario:
      "Windows users must access Azure Files over SMB by using their existing on-premises Active Directory Domain Services credentials, while the file share remains available to multiple branch offices and the team avoids switching to a separate cloud-only identity model.",
    stem: "Which two actions should you take to keep SMB access working with on-premises identities?",
    subtopic: "Configure access to storage",
    referenceTopic: "Identity-based authentication for Azure Files",

    hint: "For SMB over on-premises AD DS, what two configurations are needed: identity method and permission level?",
    options: [
      option("A", "Enable Active Directory Domain Services authentication for Azure Files on the storage account", "Azure Files must be configured for AD DS authentication to accept existing domain credentials over SMB."),
      option("B", "Assign share-level permissions to the required users or groups", "Azure Files still requires share-level authorization in addition to NTFS permissions."),
      option("C", "Enable anonymous blob access", "Anonymous access is unrelated to SMB authentication."),
      option("D", "Disable secure transfer required", "Disabling secure transfer is unnecessary and weakens security."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Azure Files SMB authentication with on-premises AD DS requires identity-based authentication on the storage account and appropriate share-level permissions for users or groups.",
  }),
  multiSelectQuestion({
    id: "Q2135",
    domain: "D2",
    type: "multi-select",
    difficulty: "medium",
    company: "Adventure Works",
    scenario:
      "An internal application must generate user delegation SAS tokens for blob access without using storage account keys, while the signing flow stays tied to Microsoft Entra authentication rather than shared credentials.",
    stem: "Which two actions are required to issue the SAS tokens safely?",
    subtopic: "Configure access to storage",
    referenceTopic: "Create a user delegation SAS",

    hint: "For user delegation SAS tokens, what two steps are needed: authentication method and what to request from Azure Storage?",
    options: [
      option("A", "Authenticate by using Microsoft Entra credentials", "A user delegation SAS is based on Microsoft Entra authentication rather than account keys."),
      option("B", "Request a user delegation key from Azure Storage", "The application must first obtain a user delegation key to sign the SAS."),
      option("C", "Deploy a NAT gateway", "A NAT gateway does not create SAS tokens."),
      option("D", "Configure a management group", "Management groups do not participate in SAS token creation."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "A user delegation SAS requires Microsoft Entra authentication and a user delegation key issued by Azure Storage.",
  }),
  yesNoQuestion({
    id: "Q2136",
    domain: "D2",
    type: "yes-no",
    difficulty: "medium",
    company: "Wingtip Distribution",
    scenario:
      "You are reviewing Azure Storage redundancy and replication statements for a production readiness review, and the team must distinguish region-level replication, zone resilience, and replica read access without mixing them up.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Storage redundancy and replication",

    hint: "Verify: Does ZRS span zones in one region? Does RA-GRS support secondary read? Can object replication use append blobs?",
    statements: [
      {
        id: "S1",
        text: "Zone-redundant storage replicates data across availability zones within a single region.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "RA-GRS provides read access to the secondary region replica.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "Object replication supports append blobs as a replication source.",
        answer: "No",
      },
    ],
    explanation:
      "ZRS spans availability zones in one region, RA-GRS supports secondary read access, and object replication is designed for block blobs rather than append blobs.",
  }),
  dragDropQuestion({
    id: "Q2137",
    domain: "D2",
    type: "drag-drop",
    difficulty: "medium",
    company: "Proseware Research",
    scenario:
      "You are configuring Azure File Sync for a branch office Windows Server that will cache frequently used files from Azure Files while the central file namespace stays in Azure and the local server only handles the branch cache.",
    stem: "Arrange the actions in the correct order so the sync topology is created safely.",
    subtopic: "Configure access to storage",
    referenceTopic: "Deploy Azure File Sync",

    hint: "For File Sync setup, what sequence: deploy service, install agent, register server, create sync group, create endpoint?",
    availableItems: [
    "Create the server endpoint",
    "Deploy the Storage Sync Service",
    "Create the sync group and cloud endpoint",
    "Register the Windows Server with the Storage Sync Service",
    "Install the Azure File Sync agent on the Windows Server"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    correctOrder: [
      "Deploy the Storage Sync Service",
      "Install the Azure File Sync agent on the Windows Server",
      "Register the Windows Server with the Storage Sync Service",
      "Create the sync group and cloud endpoint",
      "Create the server endpoint",
    ],
    explanation:
      "The sync service and server registration must exist before you can create the sync topology and finally add the server endpoint.",
  }),
  choiceQuestion({
    id: "Q2138",
    domain: "D2",
    type: "hot-area",
    difficulty: "medium",
    company: "A. Datum Logistics",
    scenario:
      "A storage account must tolerate availability zone failures in the primary region and must expose a readable secondary region endpoint for drills while the operations team validates recovery without a full failover.",
    stem: "Which redundancy option should you choose to keep both zone resilience and secondary-region read access?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Storage redundancy options",

    hint: "Which redundancy option provides zone resilience in the primary region AND read access in the secondary region?",
    options: [
      option("A", "ZRS", "ZRS provides zone resilience in the primary region only and does not expose a readable secondary region endpoint."),
      option("B", "GRS", "GRS replicates to a secondary region but does not provide read access there."),
      option("C", "RA-GZRS", "RA-GZRS provides both zone resilience in the primary region and read access in the secondary region."),
      option("D", "LRS", "LRS does not provide zone resilience or secondary-region read access."),
    ],
    correctOptionId: "C",
    explanation:
      "RA-GZRS is the only listed option that provides both zone redundancy in the primary region and read access to the secondary region replica.",
  }),
  choiceQuestion({
    id: "Q2139",
    domain: "D2",
    type: "case-study",
    difficulty: "hard",
    company: "Adatum Financial Services",
    scenario:
      "Case study: Monthly regulatory exports must remain readable from the secondary region while still providing zone resilience in the primary region, and the storage design must support audit validation during a regional outage.",
    stem: "Which storage redundancy option should you use to satisfy both availability goals?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Storage redundancy options",

    hint: "For both zone resilience in the primary region and readable secondary region, which redundancy option covers both needs?",
    caseStudyId: "CS-ADATUM-FINANCE",
    options: [
      option("A", "ZRS", "ZRS protects data within the primary region only and provides no secondary-region copy."),
      option("B", "RA-GZRS", "RA-GZRS meets both requirements by combining zone redundancy with read access to the secondary region."),
      option("C", "GRS", "GRS provides geo-replication but not read access to the secondary region."),
      option("D", "LRS", "LRS stores data only in one primary region."),
    ],
    correctOptionId: "B",
    explanation:
      "RA-GZRS is the correct answer because the exports must remain readable from the secondary region and stay resilient to zone failure in the primary region.",
  }),
  choiceQuestion({
    id: "Q2140",
    domain: "D2",
    type: "case-study",
    difficulty: "medium",
    company: "Proseware Research",
    scenario:
      "Case study: Department data must stay in Azure while branch offices cache frequently used files locally, and the branch servers must continue serving those files even when WAN latency is high.",
    stem: "Which Azure service should you deploy to keep the branch cache and the Azure copy synchronized?",
    subtopic: "Configure access to storage",
    referenceTopic: "Deploy Azure File Sync",

    hint: "Which Azure service keeps the authoritative namespace in Azure while allowing branch servers to cache frequently accessed files locally?",
    caseStudyId: "CS-PROSEWARE-RESEARCH",
    options: [
      option("A", "Azure File Sync", "Azure File Sync keeps authoritative data in Azure Files while branch servers cache frequently used content locally."),
      option("B", "An availability set", "Availability sets improve VM resiliency and do not provide file synchronization or caching."),
      option("C", "A Standard Load Balancer", "Load balancers distribute traffic and do not synchronize file shares."),
      option("D", "Azure Site Recovery", "Site Recovery provides disaster recovery rather than branch file caching."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure File Sync is the correct service because it keeps the namespace in Azure Files while allowing branch Windows Servers to cache frequently accessed files.",
  }),

  choiceQuestion({
    id: "Q2141",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Labs",
    scenario:
      "A virtual machine must access Azure Storage without storing secrets in code or on disk, and the workload should authenticate to Azure services without managing a separate credential store.",
    stem: "What should you enable on the virtual machine to support that access pattern?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Managed identities for Azure resources",

    hint: "Which VM identity type lets the workload authenticate to Azure services without stored credentials or a separate credential store?",
    options: [
      option("A", "A budget", "Budgets are unrelated to authentication from a VM."),
      option("B", "A public IP address", "A public IP affects connectivity and does not provide authenticated access to Azure services."),
      option("C", "A system-assigned managed identity", "A system-assigned managed identity lets the VM obtain tokens without stored credentials."),
      option("D", "A network security group", "An NSG filters traffic but does not provide workload identity."),
    ],
    correctOptionId: "C",
    explanation:
      "A system-assigned managed identity is the simplest way for an Azure VM to authenticate to Azure services without stored credentials.",
  }),
  choiceQuestion({
    id: "Q2142",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "You must validate a new web application build in Azure App Service before routing production traffic to it, while keeping the current production slot online and preserving a quick rollback path if validation fails.",
    stem: "Which App Service feature should you use to stage and validate the build safely?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Deployment slots",

    hint: "Which App Service feature isolates a staging environment from production while allowing safe validation before a traffic swap?",
    options: [
      option("A", "A deployment slot", "Deployment slots let you stage and validate a new version before swapping it into production."),
      option("B", "A NAT gateway", "A NAT gateway controls outbound connectivity and does not provide release staging."),
      option("C", "Azure Firewall", "Azure Firewall secures traffic but is not an App Service deployment feature."),
      option("D", "A Recovery Services vault", "A Recovery Services vault is used for backup and disaster recovery, not web release staging."),
    ],
    correctOptionId: "A",
    explanation:
      "Deployment slots are designed for staged web releases and controlled production swaps in Azure App Service.",
  }),
  choiceQuestion({
    id: "Q2143",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Litware Retail",
    scenario:
      "An App Service plan must add instances automatically when average CPU usage exceeds 70 percent while the team keeps manual scale operations available for maintenance windows.",
    stem: "Which feature should you configure to scale the plan based on CPU metrics?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Scale an App Service plan",

    hint: "Which App Service feature automatically adds or removes instances based on metrics such as CPU percentage?",
    options: [
      option("A", "Autoscale rules", "Autoscale rules can add or remove instances automatically based on metrics such as CPU usage."),
      option("B", "A management group", "Management groups organize subscriptions and do not scale App Service instances."),
      option("C", "A resource lock", "Locks protect resources but do not scale them."),
      option("D", "A private DNS zone", "Private DNS zones provide name resolution rather than scaling."),
    ],
    correctOptionId: "A",
    explanation:
      "Autoscale rules are the App Service feature used to scale out or in based on metrics like CPU percentage.",
  }),
  choiceQuestion({
    id: "Q2144",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Defense",
    scenario:
      "After deployment, each Windows virtual machine must run a PowerShell script that installs a custom monitoring agent, and the script must run inside the guest without manual RDP login on each VM.",
    stem: "Which feature should you use to run the script inside each VM?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Virtual machine extensions",

    hint: "Which VM extension executes a PowerShell script inside the guest OS after VM deployment without RDP login?",
    options: [
      option("A", "The Custom Script Extension", "The Custom Script Extension runs post-deployment scripts inside the VM guest."),
      option("B", "A load balancer", "Load balancers distribute traffic and do not run scripts inside VMs."),
      option("C", "A budget alert", "Budget alerts are unrelated to guest configuration."),
      option("D", "A user delegation SAS", "A user delegation SAS is a storage access token, not a VM configuration tool."),
    ],
    correctOptionId: "A",
    explanation:
      "The Custom Script Extension is the standard Azure VM feature for executing a script inside the guest after deployment.",
  }),
  choiceQuestion({
    id: "Q2145",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Adventure Works",
    scenario:
      "You need to run a single Linux container quickly without managing servers or a container orchestrator, and the workload is short-lived enough that you do not want to provision a host cluster.",
    stem: "Which Azure service should you use?",
    subtopic: "Provision and manage containers",
    referenceTopic: "Azure Container Instances",

    hint: "Which Azure service runs containers quickly without requiring VM or container orchestrator cluster management?",
    options: [
      option("A", "A Recovery Services vault", "A Recovery Services vault is not a container execution platform."),
      option("B", "Azure Container Instances", "ACI runs containers directly without requiring VM or cluster management."),
      option("C", "A virtual machine scale set", "VM scale sets require VM management and are not the simplest container-only option."),
      option("D", "A dedicated host", "Dedicated hosts are for VM placement on dedicated physical servers."),
    ],
    correctOptionId: "B",
    explanation:
      "Azure Container Instances is the fastest Azure option for running a container without cluster or guest OS management.",
  }),
  choiceQuestion({
    id: "Q2146",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Wingtip Digital",
    scenario:
      "A custom virtual machine image must be versioned and replicated to multiple Azure regions for consistent deployments, while operations keep a single source of truth for image versions and avoid manually copying the image to each region without introducing per-region drift.",
    stem: "Which Azure resource should store the image so it can be versioned and replicated safely?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Azure Compute Gallery",

    hint: "Which Azure resource stores versioned VM images and replicates them to multiple regions for consistent deployments?",
    options: [
      option("A", "Azure Compute Gallery", "Azure Compute Gallery is designed to version and replicate VM images across regions."),
      option("B", "A Standard Load Balancer", "Load balancers distribute traffic and do not store VM images."),
      option("C", "A local network gateway", "Local network gateways describe on-premises VPN devices and do not store images."),
      option("D", "An NSG", "NSGs control traffic and do not hold VM images."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Compute Gallery is the correct Azure service for publishing versioned VM images and replicating them to multiple regions.",
  }),
  choiceQuestion({
    id: "Q2147",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Humongous Insurance",
    scenario:
      "A stateless web tier must run on identical virtual machines and add instances automatically as demand rises while the operations team avoids managing a separate clustering layer.",
    stem: "Which Azure compute resource should you deploy for identical VMs with automatic scale-out?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Virtual machine scale sets",

    hint: "Which Azure compute resource provides identical VM instances with native autoscale and scale-out capabilities?",
    options: [
      option("A", "A virtual machine scale set", "VM scale sets provide identical VM instances with native scale operations and autoscale integration."),
      option("B", "An availability set", "Availability sets improve availability for a fixed set of VMs but do not autoscale."),
      option("C", "A dedicated host", "Dedicated hosts allocate hardware and do not provide autoscaling."),
      option("D", "A budget", "Budgets do not create compute instances."),
    ],
    correctOptionId: "A",
    explanation:
      "Virtual machine scale sets are built for identical VM fleets that need native scale-out and scale-in behavior.",
  }),
  choiceQuestion({
    id: "Q2148",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Tailwind Manufacturing",
    scenario:
      "Two production virtual machines must survive the failure of a single datacenter within one Azure region while the application remains available during planned and unplanned maintenance windows.",
    stem: "Which availability option should you use?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Availability zones",

    hint: "Which availability option protects VMs against failure of a single datacenter within one Azure region?",
    options: [
      option("A", "Availability zones", "Availability zones protect against datacenter-level failure inside a region."),
      option("B", "A local network gateway", "Local network gateways describe on-premises networks and do not improve VM resilience."),
      option("C", "A budget", "Budgets do not provide compute resiliency."),
      option("D", "An action group", "Action groups are for alerts and do not host workloads."),
    ],
    correctOptionId: "A",
    explanation:
      "Availability zones are the correct choice when virtual machines must remain available if one datacenter in a region fails.",
  }),
  choiceQuestion({
    id: "Q2149",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Proseware Travel",
    scenario:
      "An App Service application uses a staging slot for release validation. One connection string must stay different in staging and production after a slot swap, and operations must keep test data isolated while avoiding accidental production endpoint changes during deployments without delaying release windows.",
    stem: "How should you configure the connection string while preserving slot isolation?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Deployment slot settings",

    hint: "Which App Service configuration type stays bound to the slot and is NOT swapped to the target slot?",
    options: [
      option("A", "Assign it as a route table property", "Route tables manage network routes and do not hold application configuration."),
      option("B", "Store it in an NSG", "NSGs do not store App Service connection strings."),
      option("C", "Place it in a budget", "Budgets do not contain application settings."),
      option("D", "Mark it as a deployment slot setting", "Slot settings stay with the slot and are not swapped into the target slot."),
    ],
    correctOptionId: "D",
    explanation:
      "Slot-specific settings must be marked as deployment slot settings so they remain bound to the staging or production slot during swaps.",
  }),
  choiceQuestion({
    id: "Q2150",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Services",
    scenario:
      "A virtual machine is unreachable over the network, and you must execute a troubleshooting script inside the VM from the Azure portal without restoring direct inbound connectivity first.",
    stem: "Which feature should you use?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Run command",

    hint: "Which Azure feature executes troubleshooting scripts inside an unreachable VM without requiring interactive inbound network connectivity?",
    options: [
      option("A", "Run command", "Run command executes scripts inside the guest from Azure without requiring interactive inbound connectivity."),
      option("B", "A public load balancer", "A load balancer cannot execute scripts inside the guest OS."),
      option("C", "A private DNS zone", "Private DNS resolves names and does not run scripts."),
      option("D", "Azure Advisor", "Advisor provides recommendations but does not execute guest commands."),
    ],
    correctOptionId: "A",
    explanation:
      "Run command is intended for script execution and troubleshooting inside an Azure VM from the Azure control plane.",
  }),
  choiceQuestion({
    id: "Q2151",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Lucerne Commerce",
    scenario:
      "A web application is packaged as a Docker container and must support custom domains, TLS, and managed scaling without virtual machine administration while the team keeps platform operations minimal during traffic growth.",
    stem: "Which Azure service should you use?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Web App for Containers",

    hint: "Which Azure service runs web containers with built-in custom domains, TLS, and autoscaling while avoiding VM management?",
    options: [
      option("A", "Azure App Service Web App for Containers", "App Service can run containerized web apps with managed scaling, custom domains, and TLS."),
      option("B", "A dedicated host", "Dedicated hosts provide isolated hardware for VMs, not a managed web container platform."),
      option("C", "A local network gateway", "Local network gateways do not host applications."),
      option("D", "A budget", "Budgets do not provide application hosting."),
    ],
    correctOptionId: "A",
    explanation:
      "Web App for Containers is the managed Azure App Service option for containerized web applications that need platform features such as TLS and scaling.",
  }),
  choiceQuestion({
    id: "Q2152",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "A. Datum Energy",
    scenario:
      "A virtual machine fails to boot, and you must review the boot screenshot and serial log from the Azure portal while troubleshooting without waiting for guest network access.",
    stem: "Which Azure feature should you use for that boot troubleshooting workflow?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Boot diagnostics",

    hint: "Which VM troubleshooting feature shows startup screenshots and serial console output even before guest network access works?",
    options: [
      option("A", "Boot diagnostics", "Boot diagnostics captures the console screenshot and serial output during VM startup."),
      option("B", "A Standard Load Balancer", "Load balancers do not capture VM boot output."),
      option("C", "A private endpoint", "Private endpoints provide private connectivity and do not expose boot logs."),
      option("D", "A cost budget", "Budgets do not troubleshoot VM startup."),
    ],
    correctOptionId: "A",
    explanation:
      "Boot diagnostics is the Azure VM troubleshooting feature that records startup screenshots and serial console output.",
  }),
  choiceQuestion({
    id: "Q2153",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Analytics",
    scenario:
      "A nonproduction workload can tolerate interruption and must run at the lowest possible compute cost while the team accepts eviction risk and can restart jobs without guaranteed capacity.",
    stem: "Which type of virtual machine should you use to minimize cost under those constraints?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Spot virtual machines",

    hint: "If the workload can be interrupted and restarted, which VM pricing model trades availability guarantees for the lowest cost?",
    options: [
      option("A", "A Spot virtual machine", "Spot VMs provide discounted compute for interruptible workloads that can tolerate eviction."),
      option("B", "A dedicated host", "Dedicated hosts increase isolation and cost rather than minimizing cost."),
      option("C", "An availability set", "Availability sets improve availability but do not reduce VM pricing by allowing eviction."),
      option("D", "A Recovery Services vault", "A Recovery Services vault is unrelated to compute pricing."),
    ],
    correctOptionId: "A",
    explanation:
      "Spot virtual machines are designed for workloads that can tolerate interruption in exchange for lower pricing.",
  }),
  multiSelectQuestion({
    id: "Q2154",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Coho Winery",
    scenario:
      "An App Service application must retrieve secrets from Azure Key Vault without storing credentials in app settings, and the security team requires token-based access that can be centrally governed.",
    stem: "Which two actions should you take?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Managed identities and Key Vault access",

    hint: "What two things are needed for Key Vault secret retrieval without stored credentials: identity creation and secret-read authorization?",
    options: [
      option("A", "Enable a managed identity for the app", "The app needs a managed identity to request tokens from Microsoft Entra ID."),
      option("B", "Grant the app identity access to the required secrets in Key Vault", "The managed identity must be authorized to read the secrets it needs."),
      option("C", "Create a load balancer backend pool", "A backend pool is unrelated to Key Vault access."),
      option("D", "Disable HTTPS on the app", "Disabling HTTPS weakens security and does not enable Key Vault access."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "The App Service app needs a managed identity for authentication and explicit authorization in Key Vault to read secrets safely.",
  }),
  multiSelectQuestion({
    id: "Q2155",
    domain: "D3",
    type: "multi-select",
    difficulty: "hard",
    company: "Southridge Video",
    scenario:
      "A virtual machine scale set must survive the loss of one datacenter in a region and scale out automatically under higher CPU load while operations keeps service latency stable and avoids manual intervention during demand spikes. The design must balance resilience and elasticity without overprovisioning baseline capacity.",
    stem: "Which two features should you configure?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Scale sets and availability zones",

    hint: "Which pair covers both goals: resilience to a datacenter failure and automatic instance growth under CPU pressure?",
    options: [
      option("A", "Availability zones", "Availability zones protect instances against a single-datacenter failure inside a region."),
      option("B", "Autoscale rules", "Autoscale rules add or remove instances automatically based on metrics."),
      option("C", "A budget", "Budgets do not increase availability or scale compute."),
      option("D", "An action group only", "Action groups can notify but do not make a scale set zone-redundant or autoscaling."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Availability zones address datacenter failure, and autoscale rules handle dynamic instance count changes in a scale set.",
  }),
  multiSelectQuestion({
    id: "Q2156",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Wide World Importers",
    scenario:
      "You must run Linux containers on Azure without managing the guest operating system, while the operations team keeps deployment overhead low and avoids building a VM-based container host platform for routine releases.",
    stem: "Which two Azure services meet the requirement?",
    subtopic: "Provision and manage containers",
    referenceTopic: "Container hosting options",

    hint: "Which managed container services avoid guest OS administration, unlike VM-based hosting models?",
    options: [
      option("A", "Azure Container Instances", "ACI runs containers without requiring guest OS management."),
      option("B", "Azure Container Apps", "Container Apps provide managed container hosting with no guest OS administration."),
      option("C", "Virtual machine scale sets", "VM scale sets require you to manage virtual machine images and guest OS state."),
      option("D", "Dedicated hosts", "Dedicated hosts are for VM placement and still require guest OS management."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Azure Container Instances and Azure Container Apps are managed Azure services for running containers without guest OS administration.",
  }),
  multiSelectQuestion({
    id: "Q2157",
    domain: "D3",
    type: "multi-select",
    difficulty: "hard",
    company: "Graphic Design Institute",
    scenario:
      "An Azure Compute Gallery already exists. You must publish a new generalized image so multiple subscriptions can deploy virtual machines from a tracked version while platform engineering enforces a repeatable release path and avoids ad hoc image copies. The process must preserve version lineage without bypassing gallery governance controls.",
    stem: "Which two gallery objects must you create next?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Azure Compute Gallery image publishing",

    hint: "After the gallery exists, which object defines the image family and which object represents the publishable build artifact?",
    options: [
      option("A", "An image definition", "An image definition describes the image family, OS, and metadata within the gallery."),
      option("B", "An image version", "An image version holds the actual published image build used for deployments."),
      option("C", "A NAT gateway", "A NAT gateway is unrelated to publishing images."),
      option("D", "A local network gateway", "A local network gateway is used for VPN connectivity, not image publishing."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "After the gallery exists, you create an image definition and then publish one or more image versions under that definition.",
  }),
  yesNoQuestion({
    id: "Q2158",
    domain: "D3",
    type: "yes-no",
    difficulty: "easy",
    company: "Tailwind Traders",
    scenario:
      "You are reviewing Azure compute statements for a support runbook, and the team must confirm identity lifecycle, resize behavior, and container hosting facts before they update the onboarding guide.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "Managed identities, resizing, and container instances",

    hint: "Check lifecycle and platform facts: system-assigned identity lifecycle, resize/deallocate behavior, and whether ACI requires a Kubernetes cluster.",
    statements: [
      {
        id: "S1",
        text: "A system-assigned managed identity is deleted when the virtual machine is deleted.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "Resizing a virtual machine to another size family can require the VM to be stopped and deallocated.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "Azure Container Instances requires you to manage a Kubernetes cluster.",
        answer: "No",
      },
    ],
    explanation:
      "System-assigned identities share the VM lifecycle, some VM size changes require deallocation, and ACI does not require cluster management.",
  }),
  yesNoQuestion({
    id: "Q2159",
    domain: "D3",
    type: "yes-no",
    difficulty: "medium",
    company: "Adatum Manufacturing",
    scenario:
      "You are validating Azure App Service and VM availability statements for a production readiness review, and the team must separate deployment-slot behavior from Spot eviction expectations while preserving realistic availability planning.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "Deployment slots, Spot VMs, and availability",

    hint: "Validate each statement against core behavior: slot swap purpose, Spot eviction guarantees, and what availability sets do not protect against.",
    statements: [
      {
        id: "S1",
        text: "A deployment slot swap can move a validated build into production.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "Spot virtual machines are guaranteed not to be evicted during their first 24 hours.",
        answer: "No",
      },
      {
        id: "S3",
        text: "Availability sets help protect virtual machines from host maintenance and rack-level faults but not from regional outages.",
        answer: "Yes",
      },
    ],
    explanation:
      "Deployment slots support swaps, Spot VMs can be evicted when Azure needs capacity, and availability sets do not provide cross-region resilience.",
  }),
  dragDropQuestion({
    id: "Q2160",
    domain: "D3",
    type: "drag-drop",
    difficulty: "medium",
    company: "Adventure Works",
    scenario:
      "You are releasing a new version of an App Service application by using a staging slot, and the release process must validate the new build before production traffic is swapped while preserving a quick rollback path if validation fails.",
    stem: "Arrange the actions in the correct order so validation happens before production swap.",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Deployment slots",

    hint: "What deployment-slot sequence ensures safety: create slot, deploy build, validate in slot, then swap to production?",
    availableItems: [
    "Deploy the new build to the staging slot",
    "Create the staging slot",
    "Validate the build in the staging slot",
    "Swap the staging slot into production"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Create the staging slot",
      "Deploy the new build to the staging slot",
      "Validate the build in the staging slot",
      "Swap the staging slot into production",
    ],
    explanation:
      "A staging slot release flows from slot creation, to deployment, to validation, and then to the production swap.",
  }),
  dragDropQuestion({
    id: "Q2161",
    domain: "D3",
    type: "drag-drop",
    difficulty: "hard",
    company: "Northwind Air",
    scenario:
      "You are publishing and consuming a shared image by using Azure Compute Gallery for multiple application teams. The process must keep image lineage auditable while deployment teams receive a consumable version artifact, and operations must avoid direct VM deployment from unmanaged source snapshots.",
    stem: "Arrange the actions in the correct order so gallery governance is preserved before VM deployment.",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Azure Compute Gallery image publishing",

    hint: "In Compute Gallery workflows, what must exist before VM deployment: gallery, definition, version, then deployment?",
    availableItems: [
    "Create the Azure Compute Gallery",
    "Create the image version",
    "Deploy the virtual machine from the image version",
    "Create the image definition"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Create the Azure Compute Gallery",
      "Create the image definition",
      "Create the image version",
      "Deploy the virtual machine from the image version",
    ],
    explanation:
      "The gallery is the container, the definition describes the image family, the version publishes the image build, and then VMs can be deployed from that version.",
  }),
  choiceQuestion({
    id: "Q2162",
    domain: "D3",
    type: "hot-area",
    difficulty: "medium",
    company: "Proseware Media",
    scenario:
      "A containerized HTTP API must support revisions, managed ingress, and automatic scale-to-zero while the operations team avoids running cluster infrastructure and keeps release management lightweight.",
    stem: "Which Azure service should you choose?",
    subtopic: "Provision and manage containers",
    referenceTopic: "Azure Container Apps",

    hint: "Which container platform provides managed ingress, revisions, and scale-to-zero without running cluster infrastructure?",
    options: [
      option("A", "Azure Virtual Machine Scale Sets", "VM scale sets manage VMs and do not provide managed container revisions or scale-to-zero."),
      option("B", "Azure Container Apps", "Container Apps supports managed ingress, revisions, and scale-to-zero for containerized HTTP workloads."),
      option("C", "Dedicated hosts", "Dedicated hosts provide isolated VM hardware rather than a managed application container platform."),
      option("D", "Availability sets", "Availability sets improve VM availability and do not host managed container apps."),
    ],
    correctOptionId: "B",
    explanation:
      "Azure Container Apps is the Azure service aligned with managed HTTP ingress, revision support, and scale-to-zero behavior.",
  }),
  choiceQuestion({
    id: "Q2163",
    domain: "D3",
    type: "case-study",
    difficulty: "medium",
    company: "Adatum Financial Services",
    scenario:
      "Case study: The trading web application must use a staging process that minimizes downtime during regional expansion while releases are validated before cutover and rollback remains available without redeploying the previous build.",
    stem: "Which App Service feature should you use?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Deployment slots",

    hint: "Which App Service feature allows pre-production validation and controlled cutover with quick rollback?",
    caseStudyId: "CS-ADATUM-FINANCE",
    options: [
      option("A", "Deployment slots", "Deployment slots support staged validation and controlled swaps into production."),
      option("B", "A dedicated host", "Dedicated hosts are for VM isolation rather than App Service release management."),
      option("C", "A route table", "Route tables control network paths and do not support web deployment staging."),
      option("D", "A Recovery Services vault", "Recovery Services vaults are for backup and disaster recovery, not App Service releases."),
    ],
    correctOptionId: "A",
    explanation:
      "Deployment slots are the App Service feature used for low-downtime staged releases and controlled cutovers.",
  }),
  choiceQuestion({
    id: "Q2164",
    domain: "D3",
    type: "case-study",
    difficulty: "hard",
    company: "Proseware Research",
    scenario:
      "Case study: The analytics API must run on a fully managed platform that supports revisions and scales to zero while engineering avoids VM or Kubernetes administration. The solution must preserve fast release cycles without giving up operational control over ingress and revision rollbacks.",
    stem: "Which Azure service should you use while balancing managed operations and release agility?",
    subtopic: "Provision and manage containers",
    referenceTopic: "Azure Container Apps",

    hint: "For managed container releases with revisions and scale-to-zero, which service fits better than VM-centric options?",
    caseStudyId: "CS-PROSEWARE-RESEARCH",
    options: [
      option("A", "Azure Container Apps", "Container Apps is designed for managed containerized applications with revisions and scale-to-zero."),
      option("B", "A dedicated host", "Dedicated hosts require VM management and do not provide managed revisions or scale-to-zero."),
      option("C", "An availability set", "Availability sets apply to virtual machines and do not host managed container apps."),
      option("D", "A Standard Load Balancer", "A load balancer distributes traffic but does not host container workloads."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Container Apps is the best match for an HTTP API that needs revisions, managed operations, and scale-to-zero.",
  }),

  choiceQuestion({
    id: "Q2165",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Manufacturing",
    scenario:
      "Two virtual networks in the same Azure region must communicate privately by using the Microsoft backbone while traffic stays off the public internet path. Auditors must verify that cross-VNet traffic uses private IP-only routing and that routing remains transparent (no manual entry) to both teams.",
    stem: "Which networking feature should you configure?",
    subtopic: "Configure virtual networks",
    referenceTopic: "Virtual network peering",

    hint: "Which feature privately connects two VNets over the Microsoft backbone without VPN gateways?",
    options: [
      option("A", "Virtual network peering", "VNet peering connects virtual networks privately over the Microsoft backbone."),
      option("B", "A resource lock", "A resource lock does not connect networks."),
      option("C", "An action group", "An action group is used by alerts, not networking."),
      option("D", "A budget", "A budget does not provide network connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "Virtual network peering is the direct Azure feature for private connectivity between VNets on the Microsoft backbone.",
  }),
  choiceQuestion({
    id: "Q2166",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Woodgrove Grocery",
    scenario:
      "A public web application needs layer-7 load balancing and web application firewall protection while security requires centralized HTTP inspection and operations must avoid custom reverse-proxy maintenance.",
    stem: "Which Azure service should you use?",
    subtopic: "Configure load balancing",
    referenceTopic: "Application Gateway WAF",

    hint: "Which service combines layer-7 HTTP routing with integrated WAF protection in a managed offering?",
    options: [
      option("A", "Azure Application Gateway with WAF", "Application Gateway provides layer-7 routing and integrated WAF capabilities."),
      option("B", "A Standard Load Balancer", "Standard Load Balancer works at layer 4 and does not provide WAF features."),
      option("C", "A local network gateway", "A local network gateway describes an on-premises VPN endpoint."),
      option("D", "A recovery vault", "A recovery vault is unrelated to web traffic routing or inspection."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Application Gateway with WAF is the Azure service designed for layer-7 HTTP routing and web application firewall protection.",
  }),
  choiceQuestion({
    id: "Q2167",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Media",
    scenario:
      "Virtual machines in a subnet must use the same outbound public IP addresses for internet traffic while external partners allowlist only fixed egress addresses and the team avoids per-VM public IP management.",
    stem: "Which Azure resource should you associate with the subnet?",
    subtopic: "Configure virtual networks",
    referenceTopic: "NAT Gateway",

    hint: "Which subnet-level resource provides fixed outbound public IP egress for all VMs without per-VM public IPs?",
    options: [
      option("A", "A NAT gateway", "A NAT gateway provides predictable outbound public IP addresses for a subnet."),
      option("B", "A private DNS zone", "Private DNS zones provide name resolution and do not manage outbound internet translation."),
      option("C", "A budget", "Budgets do not affect network egress."),
      option("D", "An administrative unit", "Administrative units apply to Microsoft Entra objects, not subnets."),
    ],
    correctOptionId: "A",
    explanation:
      "Associate a NAT gateway with the subnet when its workloads need fixed outbound public IP addresses for internet access.",
  }),
  choiceQuestion({
    id: "Q2168",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "A. Datum Finance",
    scenario:
      "Administrators must connect to Azure virtual machines by using RDP and SSH without exposing public IP addresses on the virtual machines.",
    stem: "Which Azure service should you deploy?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Azure Bastion",

    hint: "Which service enables RDP/SSH to VMs through the portal without exposing public IP addresses on the VMs?",
    options: [
      option("A", "Azure Bastion", "Azure Bastion provides browser-based RDP and SSH connectivity without public IPs on the target VMs."),
      option("B", "A budget alert", "Budgets do not provide administrative connectivity."),
      option("C", "An availability set", "Availability sets improve VM resilience and do not provide secure admin access."),
      option("D", "A Log Analytics workspace", "Log Analytics collects and queries logs rather than providing VM connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Bastion is designed for secure RDP and SSH access to VMs without assigning public IP addresses to those virtual machines.",
  }),
  choiceQuestion({
    id: "Q2169",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Northwind Shipping",
    scenario:
      "A datacenter must connect privately to Azure over a dedicated circuit instead of the public internet while network engineering preserves predictable latency for business-critical traffic. The design must increase reliability without relying on internet VPN transport.",
    stem: "Which Azure connectivity option should you choose for that private hybrid design?",
    subtopic: "Configure connectivity from on-premises networks",
    referenceTopic: "ExpressRoute",

    hint: "Which hybrid connectivity option uses a private dedicated circuit instead of internet-based VPN transport?",
    options: [
      option("A", "ExpressRoute", "ExpressRoute provides private connectivity to Azure over a dedicated circuit."),
      option("B", "A public load balancer", "A public load balancer does not create private on-premises connectivity."),
      option("C", "A resource lock", "A lock does not provide network connectivity."),
      option("D", "An administrative unit", "Administrative units are unrelated to hybrid network connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "ExpressRoute is the Azure option for private, dedicated connectivity between on-premises infrastructure and Azure.",
  }),
  choiceQuestion({
    id: "Q2170",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Tailwind Pharmaceuticals",
    scenario:
      "You need a central network security service that can filter outbound traffic by FQDN and provide DNAT and SNAT capabilities while security operations enforces one managed egress policy set across multiple subnets and must keep policy administration centralized.",
    stem: "Which Azure service should you use?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Azure Firewall",

    hint: "Which centralized network security service supports FQDN filtering plus DNAT/SNAT across multiple subnets?",
    options: [
      option("A", "Azure Firewall", "Azure Firewall provides centralized network and application filtering plus DNAT and SNAT."),
      option("B", "A private DNS zone", "Private DNS zones resolve names but do not filter traffic."),
      option("C", "A budget", "Budgets do not inspect or route traffic."),
      option("D", "Blob versioning", "Blob versioning is a storage protection feature."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Firewall provides centralized FQDN-based filtering (private DNS zones only do DNS resolution; NSGs don't inspect FQDN), DNAT/SNAT translation, and single-point policy administration across all subnets—unlike NSGs which are subnet-bound and don't support application-layer FQDN rules.",
  }),
  choiceQuestion({
    id: "Q2171",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Humongous Insurance",
    scenario:
      "Multiple virtual networks must resolve the DNS names of private endpoints correctly while application teams avoid hardcoded IP usage across environments.",
    stem: "What should you deploy to provide consistent private endpoint DNS resolution?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Private DNS for private endpoints",

    hint: "Which DNS approach resolves private endpoint names to private IPs across multiple VNets through linking?",
    options: [
      option("A", "A private DNS zone linked to the virtual networks", "Private DNS zones linked to the VNets resolve private endpoint names to private IP addresses."),
      option("B", "A public DNS zone only", "A public DNS zone does not resolve private endpoint names to private IPs inside VNets."),
      option("C", "A resource lock", "A lock does not provide DNS resolution."),
      option("D", "A budget", "Budgets do not affect name resolution."),
    ],
    correctOptionId: "A",
    explanation:
      "Private endpoints require the appropriate private DNS zone and VNet links so consumers resolve service names to the private endpoint IP address.",
  }),
  choiceQuestion({
    id: "Q2172",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Proseware Data",
    scenario:
      "A storage account must stay reachable only from selected subnets over the Microsoft backbone, while the service should continue to use its public endpoint rather than a private IP address and network policy must remain centrally enforceable.",
    stem: "Which networking feature should you configure?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Service endpoints",

    hint: "If the service must keep its public endpoint but only allow selected subnets over the backbone, which feature fits better than private endpoints?",
    options: [
      option("A", "A service endpoint", "Service endpoints extend the selected subnet identity to the public service endpoint over the Microsoft backbone."),
      option("B", "A private endpoint", "A private endpoint assigns a private IP in the VNet, which the scenario explicitly does not require."),
      option("C", "A Standard Load Balancer", "A load balancer does not secure Azure PaaS services from selected subnets."),
      option("D", "A budget alert", "Budgets do not control storage network access."),
    ],
    correctOptionId: "A",
    explanation:
      "Service endpoints are the correct feature when traffic should stay on the Microsoft backbone while the service continues to use its public endpoint.",
  }),
  choiceQuestion({
    id: "Q2173",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso Retail",
    scenario:
      "You must distribute TCP traffic across two virtual machines that host the same application while keeping the solution native to Azure layer-4 load balancing without custom proxy services.",
    stem: "Which Azure load-balancing service should you use?",
    subtopic: "Configure load balancing",
    referenceTopic: "Azure Load Balancer",

    hint: "Which native Azure service handles layer-4 TCP/UDP distribution across backend VMs?",
    options: [
      option("A", "A Standard Load Balancer", "Azure Load Balancer distributes layer-4 TCP and UDP traffic across backend instances."),
      option("B", "A private DNS zone", "Private DNS zones resolve names and do not distribute traffic."),
      option("C", "A budget", "Budgets do not load-balance traffic."),
      option("D", "A Recovery Services vault", "Recovery Services vaults are used for backup and disaster recovery."),
    ],
    correctOptionId: "A",
    explanation:
      "Use Azure Standard Load Balancer when TCP or UDP traffic must be balanced across multiple backend virtual machines.",
  }),
  choiceQuestion({
    id: "Q2174",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Wingtip Research",
    scenario:
      "All internet-bound traffic from a subnet must be sent first to an Azure Firewall instance while security operations keeps one egress inspection point and prevents direct internet bypass.",
    stem: "Which Azure resource should you associate with the subnet?",
    subtopic: "Configure virtual networks",
    referenceTopic: "User-defined routes",

    hint: "What subnet association forces all 0.0.0.0/0 traffic to an Azure Firewall private IP before internet egress?",
    options: [
      option("A", "A route table with a default route to the firewall private IP", "A user-defined route can send 0.0.0.0/0 traffic to the firewall as a virtual appliance next hop."),
      option("B", "An action group", "Action groups are alert targets and do not change traffic flow."),
      option("C", "A budget", "Budgets do not route traffic."),
      option("D", "A policy initiative", "Azure Policy can enforce configuration but does not itself route packets."),
    ],
    correctOptionId: "A",
    explanation:
      "Use a route table with a default route so the subnet forwards outbound traffic to the Azure Firewall instance.",
  }),
  choiceQuestion({
    id: "Q2175",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "A. Datum Manufacturing",
    scenario:
      "A site-to-site VPN design requires two active tunnels to Azure for higher resiliency while the branch remains online during one gateway-instance fault. Network engineering must maximize tunnel availability without relying on a single active VPN instance during failover events.",
    stem: "Which Azure gateway configuration should you use to balance resiliency and operational continuity?",
    subtopic: "Configure connectivity from on-premises networks",
    referenceTopic: "VPN Gateway",

    hint: "Which VPN Gateway mode uses two active Azure gateway instances to support resilient dual tunnels?",
    options: [
      option("A", "An active-active VPN gateway", "Active-active VPN gateways use two active instances and can provide resilient dual tunnels."),
      option("B", "A local network gateway", "A local network gateway describes the on-premises endpoint and is not the Azure gateway itself."),
      option("C", "A public load balancer", "A load balancer does not terminate site-to-site VPN connections."),
      option("D", "An availability set", "Availability sets do not provide VPN connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "An active-active VPN gateway is the Azure-side configuration used when resilient dual VPN tunnels are required.",
  }),
  multiSelectQuestion({
    id: "Q2176",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Coho Logistics",
    scenario:
      "You need to use a network security group to filter traffic for an application subnet and for one specific virtual machine network interface while the security team keeps policy scopes explicit and must avoid duplicate rule sets.",
    stem: "Which two Azure resources can be associated directly with an NSG?",
    subtopic: "Configure network security groups",
    referenceTopic: "NSG association scopes",

    hint: "Think about the two network topology levels where NSG policy is enforced — the subnet boundary that protects all resources behind it, and the individual NIC that provides per-VM control.",
    options: [
      option("A", "A subnet", "NSGs can be associated directly with a subnet."),
      option("B", "A network interface", "NSGs can also be associated directly with an individual NIC."),
      option("C", "A management group", "Management groups do not support NSG association."),
      option("D", "A Recovery Services vault", "Recovery Services vaults are unrelated to NSG attachment."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Network security groups can be associated with subnets or with individual network interfaces.",
  }),
  multiSelectQuestion({
    id: "Q2177",
    domain: "D4",
    type: "multi-select",
    difficulty: "hard",
    company: "Litware Research",
    scenario:
      "On-premises DNS servers must resolve Azure private endpoint names without hosting the records locally, while network operations preserves centralized name resolution in Azure and avoids manual record synchronization across datacenter DNS zones.",
    stem: "Which two Azure resources should you deploy?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Azure Private DNS Resolver and private DNS zones",

    hint: "On-premises DNS needs two things from Azure: a place to hold the private endpoint DNS records, and a target IP address it can forward queries to using conditional forwarding.",
    options: [
      option("A", "A private DNS zone for the private endpoint namespace", "The private DNS zone stores the private endpoint DNS records."),
      option("B", "An Azure Private DNS Resolver inbound endpoint", "The inbound endpoint lets on-premises DNS servers forward private queries into Azure."),
      option("C", "A NAT gateway", "A NAT gateway manages outbound internet access and does not resolve private names."),
      option("D", "A budget", "Budgets do not participate in DNS resolution."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "The private DNS zone holds the records, and a Private DNS Resolver inbound endpoint allows on-premises DNS infrastructure to forward private endpoint queries into Azure.",
  }),
  multiSelectQuestion({
    id: "Q2178",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Fourth Coffee",
    scenario:
      "You are reviewing design statements for virtual network peering while the network architecture team must document backbone behavior and transitivity limits for an upcoming hub-and-spoke rollout.",
    stem: "Which two statements about VNet peering are correct?",
    subtopic: "Configure virtual networks",
    referenceTopic: "Virtual network peering",

    hint: "Recall what path traffic takes between two peered VNets, then consider what does NOT happen automatically when VNet A peers with B and B peers with C — does A reach C without extra configuration?",
    options: [
      option("A", "Peered virtual networks communicate over the Microsoft backbone", "Peering traffic uses the Microsoft private network rather than the public internet."),
      option("B", "VNet peering is nontransitive", "Transitive connectivity is not provided automatically through peered VNets."),
      option("C", "VNet peering requires a VPN gateway in each VNet", "Peering does not require VPN gateways."),
      option("D", "VNet peering routes traffic through the public internet by default", "Peering uses the Microsoft backbone, not public internet paths."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "VNet peering uses the Microsoft backbone and is nontransitive unless additional routing architectures are added.",
  }),
  yesNoQuestion({
    id: "Q2179",
    domain: "D4",
    type: "yes-no",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "You are reviewing private and service endpoint statements for a security design review, and the team must distinguish private IP behavior from Microsoft-backbone service-endpoint routing without mixing concepts.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Private endpoints and service endpoints",

    hint: "One endpoint type creates a NIC with a private IP inside your VNet for the service; the other adds VNet-level access control to the service's existing public endpoint — the public address is unchanged.",
    statements: [
      {
        id: "S1",
        text: "A private endpoint assigns a private IP address from your virtual network to the service connection.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "A service endpoint keeps the PaaS service on its public endpoint.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "A service endpoint provides a private IP address inside your subnet for the service.",
        answer: "No",
      },
    ],
    explanation:
      "Private endpoints allocate a private IP in the VNet, while service endpoints secure access to the service's public endpoint over the Microsoft backbone.",
  }),
  yesNoQuestion({
    id: "Q2180",
    domain: "D4",
    type: "yes-no",
    difficulty: "easy",
    company: "Adventure Works",
    scenario:
      "You are validating network security group statements, and the operations team must confirm rule priority behavior and default-rule scope before enforcing a new baseline.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Configure network security groups",
    referenceTopic: "NSG rules and defaults",

    hint: "In NSG rule processing, lower priority numbers win. Remember also that every new NSG starts with built-in default rules, and that both a subnet and a NIC are valid attachment points.",
    statements: [
      {
        id: "S1",
        text: "An NSG rule with priority 100 is processed before a rule with priority 200.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "Every NSG includes default rules.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "An NSG can be associated only with subnets and never with network interfaces.",
        answer: "No",
      },
    ],
    explanation:
      "Lower priority numbers are processed first, NSGs include default rules, and NSGs can be associated with both subnets and NICs.",
  }),
  dragDropQuestion({
    id: "Q2181",
    domain: "D4",
    type: "drag-drop",
    difficulty: "medium",
    company: "Contoso Retail",
    scenario:
      "You are publishing an internet-facing application by using Azure Application Gateway, and the deployment must define frontend, backend, and listener dependencies before traffic routing is activated.",
    stem: "Arrange the actions in the correct order so gateway components are configured safely.",
    subtopic: "Configure load balancing",
    referenceTopic: "Application Gateway configuration",

    hint: "Work backward from the routing rule: it must reference both a listener and a backend pool, so both must exist first. The gateway itself must exist before any component can be added to it.",
    availableItems: [
    "Add the backend pool",
    "Create the routing rule",
    "Create the Application Gateway with its frontend configuration",
    "Create the listener"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Create the Application Gateway with its frontend configuration",
      "Add the backend pool",
      "Create the listener",
      "Create the routing rule",
    ],
    explanation:
      "The gateway must exist first, then its backend pool and listener can be defined, followed by a routing rule that ties them together.",
  }),
  dragDropQuestion({
    id: "Q2182",
    domain: "D4",
    type: "drag-drop",
    difficulty: "hard",
    company: "Fabrikam Industrial",
    scenario:
      "You are configuring site-to-site VPN connectivity between an on-premises network and Azure while network engineering must bring up the tunnel sequence correctly and avoid connection failures caused by missing gateway prerequisites. The rollout must remain repeatable without skipping foundational gateway steps.",
    stem: "Arrange the actions in the correct order so resilient VPN connectivity can be established.",
    subtopic: "Configure connectivity from on-premises networks",
    referenceTopic: "Configure a site-to-site VPN",

    hint: "The VPN gateway requires a GatewaySubnet to deploy into. The site-to-site connection requires both the VPN gateway and the local network gateway. Build each resource in strict dependency order.",
    availableItems: [
    "Deploy the virtual network gateway",
    "Create the local network gateway",
    "Create the GatewaySubnet",
    "Create the site-to-site connection"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Create the GatewaySubnet",
      "Deploy the virtual network gateway",
      "Create the local network gateway",
      "Create the site-to-site connection",
    ],
    explanation:
      "Azure needs the gateway subnet and virtual network gateway first, then the on-premises endpoint definition, and finally the connection between them.",
  }),
  choiceQuestion({
    id: "Q2183",
    domain: "D4",
    type: "hot-area",
    difficulty: "medium",
    company: "Tailwind Traders",
    scenario:
      "A public web application needs layer-7 routing plus web application firewall protection while security operations enforces centralized HTTP inspection and avoids separate third-party reverse-proxy appliances.",
    stem: "Which Azure service should you choose?",
    subtopic: "Configure load balancing",
    referenceTopic: "Application Gateway WAF",

    hint: "Two requirements narrow the field: layer-7 routing (rules out Azure Load Balancer at layer 4) and integrated WAF (distinguishes Application Gateway with WAF from all other options).",
    options: [
      option("A", "Azure Application Gateway with WAF", "Application Gateway is the Azure layer-7 load balancer with integrated WAF capability."),
      option("B", "Azure Load Balancer", "Azure Load Balancer works at layer 4 and does not provide WAF features."),
      option("C", "Azure Bastion", "Azure Bastion provides administrative VM access rather than application publishing."),
      option("D", "Azure Backup", "Azure Backup is unrelated to HTTP routing or WAF protection."),
    ],
    correctOptionId: "A",
    explanation:
      "Application Gateway with WAF is the correct Azure service for layer-7 web traffic routing with integrated web application firewall protection.",
  }),
  choiceQuestion({
    id: "Q2184",
    domain: "D4",
    type: "case-study",
    difficulty: "medium",
    company: "Adatum Financial Services",
    scenario:
      "Case study: Adatum's security team must let approved administrators reach application virtual machines for occasional RDP and SSH troubleshooting while keeping the spoke subnet private. The design is required to prevent direct internet exposure, ensure sessions start from the Azure portal, and avoid assigning public IP addresses to individual VMs.",
    stem: "Which Azure service should you deploy to meet these access constraints?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Azure Bastion",

    hint: "The requirement bans public IPs on VMs and open inbound NSG ports, and requires portal-initiated sessions. There is one Azure service purpose-built for this browser-based RDP/SSH pattern.",
    caseStudyId: "CS-ADATUM-FINANCE",
    options: [
      option("A", "Azure Bastion", "Azure Bastion provides secure browser-based RDP and SSH access without public IPs on the VMs."),
      option("B", "A public load balancer", "A public load balancer exposes public connectivity and does not provide administrative RDP or SSH service."),
      option("C", "A route table", "A route table changes traffic flow but does not provide administrator access."),
      option("D", "An availability set", "Availability sets affect VM placement and resiliency, not administrative connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Bastion is the appropriate Azure service for secure RDP and SSH access to VMs without public IP exposure.",
  }),
  choiceQuestion({
    id: "Q2185",
    domain: "D4",
    type: "case-study",
    difficulty: "medium",
    company: "Proseware Research",
    scenario:
      "Case study: Proseware runs batch processors in a dedicated subnet that only needs outbound internet access for partner APIs. Operations must present a predictable public source address range while scaling multiple hosts, ensure the subnet uses shared egress, and prevent each VM from requiring its own public IP.",
    stem: "Which Azure resource should you associate with the subnet to satisfy those outbound requirements?",
    subtopic: "Configure virtual networks",
    referenceTopic: "NAT Gateway",

    hint: "When multiple VMs in one subnet need a stable, shared set of outbound public IPs, one Azure resource is associated with the subnet to centralize SNAT — no public IPs on individual VMs needed.",
    caseStudyId: "CS-PROSEWARE-RESEARCH",
    options: [
      option("A", "A NAT gateway", "NAT Gateway provides fixed outbound public IP addresses for subnet egress."),
      option("B", "A private DNS zone", "Private DNS zones resolve names and do not manage outbound public IPs."),
      option("C", "A budget alert", "Budgets do not change network egress behavior."),
      option("D", "A Recovery Services vault", "Recovery Services vaults are unrelated to outbound internet connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "NAT Gateway is the Azure service used to provide predictable, shared outbound public IP addresses for workloads in a subnet.",
  }),

  choiceQuestion({
    id: "Q2186",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Advisory",
    scenario:
      "Operations teams are centralizing troubleshooting for several subscriptions and must let engineers run KQL queries against retained platform events and application telemetry from one place instead of opening each resource separately.",
    stem: "Which Azure resource should you use for that centralized log analysis?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Log Analytics workspaces",

    hint: "KQL queries require a log store, not just a stream. Application Insights is application-performance focused; the answer is the platform-level Azure Monitor data store for cross-resource log retention and querying.",
    options: [
      option("A", "A Log Analytics workspace", "Log Analytics workspaces are the Azure Monitor log data platform for KQL queries and analysis."),
      option("B", "An Application Insights workspace", "Application Insights is app-focused telemetry (APM), whereas Log Analytics is platform-focused logging and events."),
      option("C", "An Event Hub namespace", "Event Hub is used for telemetry streaming and ingestion, but not for centralized log analytics queries."),
      option("D", "An availability set", "Availability sets provide VM placement guidance and not centralized logging."),
    ],
    correctOptionId: "A",
    explanation:
      "A Log Analytics workspace is the Azure resource used to store, search, and analyze Azure Monitor log data with KQL.",
  }),
  choiceQuestion({
    id: "Q2187",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Litware Health",
    scenario:
      "A healthcare operations team is standardizing alerting for production workloads. Multiple alert rules must notify the same mailbox and webhook, while new rules are required to reuse an existing target definition without recreating the notification settings each time.",
    stem: "Which Azure Monitor component should you create as the reusable notification target?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Action groups",

    hint: "Alert rules and notification targets are separate objects in Azure Monitor. The reusable container for email addresses, webhooks, and automation targets is designed to be shared across many alert rules.",
    options: [
      option("A", "An action group", "Action groups hold reusable notification and automation targets for alert rules."),
      option("B", "A route table", "Route tables control packet flow and do not store alert targets."),
      option("C", "A resource lock", "Resource locks do not define alert actions."),
      option("D", "A private endpoint", "Private endpoints do not define notifications or automation targets."),
    ],
    correctOptionId: "A",
    explanation:
      "Action groups are the reusable Azure Monitor objects that contain email, webhook, and other alert actions.",
  }),
  choiceQuestion({
    id: "Q2188",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "A. Datum Logistics",
    scenario:
      "A logistics platform team needs a single monitoring experience for Azure virtual machines that must surface performance charts, dependency maps, and health insights while reducing manual dashboard assembly. The solution should use built-in Azure Monitor views and prevent operators from stitching together separate tools only for basic VM analysis.",
    stem: "Which Azure Monitor feature should you enable for those VM diagnostics?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "VM insights",

    hint: "Azure Monitor has a feature specifically named for VMs that provides curated built-in views for guest performance counters, process dependency maps, and health criteria — no manual dashboard assembly required.",
    options: [
      option("A", "VM insights", "VM insights provides curated performance, dependency, and health views for Azure and Arc-enabled machines."),
      option("B", "A site-to-site VPN", "VPN gateways do not provide compute monitoring dashboards."),
      option("C", "A budget alert", "Cost alerts do not provide guest performance or dependency mapping."),
      option("D", "A management group", "Management groups organize subscriptions and do not provide VM telemetry views."),
    ],
    correctOptionId: "A",
    explanation:
      "VM insights is the Azure Monitor feature built for deep virtual machine performance, dependency, and health analysis.",
  }),
  choiceQuestion({
    id: "Q2189",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Fabrikam Research",
    scenario:
      "A research division stores critical datasets in Azure Blob Storage and is required to add operational backup for rapid recovery from accidental overwrite or delete events. The protection design must cover blob workloads while avoiding a broader vault type that is commonly used for VM backups, ensure administrators can manage the policy from the correct Azure Backup resource, and prevent choosing a networking component that offers no data protection.",
    stem: "Which Azure resource should you use to manage the protection while meeting those blob-backup constraints?",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Backup vault and operational backup for blobs",

    hint: "Azure Backup has two vault types: Recovery Services vault (VMs, on-premises, SQL, SAP) and Backup vault (newer workloads including Azure Blobs, managed disks, PostgreSQL). Match the vault to the workload type.",
    options: [
      option("A", "A Backup vault", "Operational backup for Azure Blobs is managed through a Backup vault."),
      option("B", "A Recovery Services vault", "Recovery Services vaults are used for VM/on-premises backup, not Azure Blob operational backup."),
      option("C", "An Azure Site Recovery vault", "Site Recovery is for disaster recovery and migration, not blob backup management."),
      option("D", "An NSG", "NSGs control network traffic and do not manage backups."),
    ],
    correctOptionId: "A",
    explanation:
      "Operational backup for Azure Blobs is managed by Azure Backup through a Backup vault, not a Recovery Services vault.",
  }),
  choiceQuestion({
    id: "Q2190",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Retail",
    scenario:
      "Northwind wants platform logs and metrics from a storage account to flow into a central Log Analytics workspace for retention and investigation. Administrators must configure the export on the storage account itself, ensure both signal types can be routed, and prevent relying on a setting that only protects the resource from change.",
    stem: "Which feature should you configure on the storage account to send that telemetry?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Diagnostic settings",

    hint: "Diagnostic settings are configured per-resource and control where that resource's own platform logs and metrics flow. The Activity Log and Log Analytics agents are different data sources, not export configurations.",
    options: [
      option("A", "Diagnostic settings", "Diagnostic settings route platform logs and metrics to destinations such as Log Analytics workspaces."),
      option("B", "Activity Log", "Activity Log captures subscription-level events, but diagnostic settings are the resource-level configuration for telemetry export."),
      option("C", "A Log Analytics agent", "The agent is deployed on VMs to collect guest logs; diagnostic settings are the resource-level configuration on the storage account."),
      option("D", "A NAT gateway", "NAT gateways affect outbound internet access, not observability configuration."),
    ],
    correctOptionId: "A",
    explanation:
      "Diagnostic settings are the Azure resource configuration used to send platform logs and metrics to Log Analytics and other destinations.",
  }),
  choiceQuestion({
    id: "Q2191",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Proseware Manufacturing",
    scenario:
      "You need to see planned Microsoft maintenance events and outages that might affect resources in your Azure region while the operations team keeps one portal view for subscription-impacting platform incidents.",
    stem: "Which Azure service should you use for that platform health visibility?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Service Health",

    hint: "Azure Monitor surfaces your own resource telemetry and alert conditions. Service Health is a separate portal blade showing Microsoft's view of the Azure platform — incidents, planned maintenance, and health advisories.",
    options: [
      option("A", "Service Health", "Service Health reports Azure service incidents, planned maintenance, and health advisories that affect your subscriptions."),
      option("B", "Azure Monitor", "Azure Monitor provides alerts and metrics, but Service Health specifically shows service incidents and planned maintenance."),
      option("C", "An Application Gateway", "Application Gateway routes layer-7 traffic and does not report Azure platform incidents."),
      option("D", "An NSG", "NSGs control traffic but do not surface platform health information."),
    ],
    correctOptionId: "A",
    explanation:
      "Service Health is the Azure portal experience used to view service incidents, planned maintenance, and health advisories affecting your subscriptions.",
  }),
  choiceQuestion({
    id: "Q2192",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum Shipping",
    scenario:
      "A virtual machine must be replicated to another Azure region, and operations wants to test the recovery process without interrupting ongoing replication while proving the recovery plan before a real outage occurs. The team must validate failover readiness without breaking the live protection workflow or pausing replication for production workloads.",
    stem: "Which Azure service and operation should you use to balance recovery validation with uninterrupted protection?",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Azure Site Recovery test failover",

    hint: "ASR test failover spins up recovery VMs in an isolated test network, validating your recovery plan without pausing active replication or affecting the live protected source environment.",
    options: [
      option("A", "Azure Site Recovery test failover", "ASR test failover validates recovery without interrupting ongoing replication."),
      option("B", "A resource lock", "Locks do not provide disaster recovery or test failover."),
      option("C", "A budget alert", "Budgets do not replicate workloads."),
      option("D", "Blob versioning", "Blob versioning does not replicate virtual machines to another region."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Site Recovery with test failover is the correct approach for validating regional VM recovery without affecting replication.",
  }),
  multiSelectQuestion({
    id: "Q2193",
    domain: "D5",
    type: "multi-select",
    difficulty: "medium",
    company: "Woodgrove Bank",
    scenario:
      "A single alert response must notify the operations mailbox and invoke an Azure Function while operations standardizes one reusable alert target set for multiple production alerts.",
    stem: "Which two action types can you add to one action group to satisfy that response pattern?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Action groups",

    hint: "Action groups support both human notification channels (email, SMS, voice) and automation targets (Azure Function, Logic App, runbook). Identify the two types that directly match the scenario's stated requirements.",
    options: [
      option("A", "Email", "Action groups can send email notifications to operators."),
      option("B", "Azure Function", "Action groups can invoke an Azure Function as an automation target."),
      option("C", "GatewaySubnet", "GatewaySubnet is a VNet subnet name used by VPN or ExpressRoute gateways, not an alert action."),
      option("D", "Availability set", "Availability sets do not act as alert actions."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Action groups can combine human notifications such as email with automation targets such as Azure Functions.",
  }),
  multiSelectQuestion({
    id: "Q2194",
    domain: "D5",
    type: "multi-select",
    difficulty: "hard",
    company: "Humongous Insurance",
    scenario:
      "You must protect an Azure virtual machine by using Azure Backup while backup administrators keep policy and recovery settings centrally managed. The design must use the correct protection container and scheduling object without introducing unrelated networking dependencies or weakening operational consistency.",
    stem: "Which two items are required to configure that VM protection correctly?",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Azure VM backup",

    hint: "Azure VM backup needs a container for recovery points and a schedule-and-retention definition. These map to two distinct Azure Backup resource types that must both exist before the first backup can run.",
    options: [
      option("A", "A Recovery Services vault", "Azure VM backup uses a Recovery Services vault as the protection container."),
      option("B", "A backup policy", "The backup policy defines the schedule and retention settings for the protected VM."),
      option("C", "A NAT gateway", "A NAT gateway is unrelated to backup configuration."),
      option("D", "A public DNS zone", "A public DNS zone is not required to protect a VM with Azure Backup."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Azure VM backup requires a Recovery Services vault and a backup policy to define how the VM is protected.",
  }),
  yesNoQuestion({
    id: "Q2195",
    domain: "D5",
    type: "yes-no",
    difficulty: "easy",
    company: "Adventure Works",
    scenario:
      "You are reviewing Azure monitoring statements for an onboarding guide, and the team must separate platform event data from queryable log storage while avoiding confusion about Service Health coverage.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Activity Log, Log Analytics, and Service Health",

    hint: "Activity Log = control-plane events; Log Analytics = queryable data store; Service Health = Azure platform health. S3 tests whether you confuse Service Health (platform alerts) with Azure Monitor VM diagnostics (guest OS).",
    statements: [
      {
        id: "S1",
        text: "The Azure Activity Log records subscription-level control plane events.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "A Log Analytics workspace stores queryable log data for KQL analysis.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "Service Health displays only guest operating system events from your virtual machines.",
        answer: "No",
      },
    ],
    explanation:
      "The Activity Log records control-plane events, Log Analytics stores queryable logs, and Service Health reports Azure service issues rather than guest OS events.",
  }),
  yesNoQuestion({
    id: "Q2196",
    domain: "D5",
    type: "yes-no",
    difficulty: "medium",
    company: "Fabrikam Media",
    scenario:
      "You are reviewing Azure Monitor alerting statements for a maintenance-window design, and the team must distinguish alert suppression, threshold behavior, and action execution without mixing those responsibilities.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Alert processing rules and metric alerts",

    hint: "Three distinct Azure Monitor concepts: alert processing rules suppress or route alerts (S1), metric alerts support ML-based dynamic thresholds (S2), action groups define actions — they are not data stores (S3).",
    statements: [
      {
        id: "S1",
        text: "Alert processing rules can suppress alert notifications during a maintenance window.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "Metric alerts can use dynamic thresholds.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "Action groups are used to store long-term log data.",
        answer: "No",
      },
    ],
    explanation:
      "Alert processing rules can change how alerts are handled, metric alerts support dynamic thresholds, and action groups define actions rather than storing logs.",
  }),
  yesNoQuestion({
    id: "Q2197",
    domain: "D5",
    type: "yes-no",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "You are validating patching and disaster recovery statements for an operations runbook, and the team must distinguish centralized patch orchestration from recovery validation behavior without mixing those services.",
    stem: "For each statement, answer Yes if the statement is correct. Otherwise, answer No.",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Update Manager and Site Recovery",

    hint: "Azure Update Manager is a standalone native service with no Automation account dependency (unlike the retired Automation-based Update Management). ASR test failover is non-destructive — replication continues throughout.",
    statements: [
      {
        id: "S1",
        text: "Azure Update Manager can orchestrate patching without requiring an Azure Automation account.",
        answer: "Yes",
      },
      {
        id: "S2",
        text: "A test failover in Azure Site Recovery can be run without stopping replication.",
        answer: "Yes",
      },
      {
        id: "S3",
        text: "Backup policies are created inside network security groups.",
        answer: "No",
      },
    ],
    explanation:
      "Update Manager does not require an Automation account, ASR test failover does not stop replication, and backup policies belong to backup services rather than NSGs.",
  }),
  dragDropQuestion({
    id: "Q2198",
    domain: "D5",
    type: "drag-drop",
    difficulty: "hard",
    company: "Litware Retail",
    scenario:
      "You are validating disaster recovery readiness for an Azure virtual machine by using Azure Site Recovery while the operations team must prove recovery steps before an outage and avoid skipping prerequisites that would invalidate the test. The runbook must keep replication intact while still producing a repeatable validation workflow.",
    stem: "Arrange the actions in the correct order so recovery validation happens without breaking protection.",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Azure Site Recovery",

    hint: "The vault must exist before replication can be configured. Replication must be active before a test failover is possible. After any test failover, always clean up the test environment to avoid cost and state confusion.",
    availableItems: [
    "Enable replication for the virtual machine",
    "Create the Recovery Services vault",
    "Run a test failover",
    "Clean up the test failover"
  ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Create the Recovery Services vault",
      "Enable replication for the virtual machine",
      "Run a test failover",
      "Clean up the test failover",
    ],
    explanation:
      "The vault is required first, then replication can be enabled, then recovery can be validated with a test failover and cleaned up afterward.",
  }),
  choiceQuestion({
    id: "Q2199",
    domain: "D5",
    type: "case-study",
    difficulty: "medium",
    company: "Adatum Financial Services",
    scenario:
      "Case study: Virtual machine patch orchestration must be managed from one central Azure service while security operations keeps update assessment and deployment scheduling consistent across the estate.",
    stem: "Which Azure service should you configure for that centralized patch workflow?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Azure Update Manager",

    hint: "Update Manager both assesses and deploys patches on a schedule. Azure Policy enforces configuration compliance but does not push patches. Azure Advisor provides recommendations only — it neither plans nor executes deployments.",
    caseStudyId: "CS-ADATUM-FINANCE",
    options: [
      option("A", "Azure Update Manager", "Update Manager centrally orchestrates patch assessment and deployment for Azure and Arc-enabled machines."),
      option("B", "Azure Advisor", "Advisor provides recommendations and does not orchestrate patching."),
      option("C", "Azure Policy", "Azure Policy can enforce settings but does not perform patch orchestration."),
      option("D", "A local network gateway", "A local network gateway is a VPN configuration object, not a patch management service."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Update Manager is the correct central Azure service for VM patch assessment and patch orchestration. Azure Policy can enforce settings but doesn't orchestrate patching; Advisor only recommends updates; neither handles deployment scheduling like Update Manager does.",
  }),
  choiceQuestion({
    id: "Q2200",
    domain: "D5",
    type: "case-study",
    difficulty: "medium",
    company: "Proseware Research",
    scenario:
      "Case study: Alert notifications and automation targets must be reusable across multiple alert rules while the monitoring team avoids recreating the same response configuration for each new alert.",
    stem: "What should you create to standardize those reusable alert responses?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Action groups",

    hint: "In Azure Monitor, alert rules detect conditions, but response actions live in a separate named object. That object is designed to be created once and referenced by many rules — a 'define once, reuse everywhere' pattern.",
    caseStudyId: "CS-PROSEWARE-RESEARCH",
    options: [
      option("A", "An action group", "Action groups are reusable containers for alert notifications and automation endpoints."),
      option("B", "An Azure Automation runbook", "Runbooks execute task automation, whereas action groups define alert notification targets and automated responses."),
      option("C", "A virtual machine scale set", "A scale set hosts compute and does not standardize alert notifications."),
      option("D", "A budget", "Budgets can create cost alerts but do not act as reusable alert action containers for general monitoring rules."),
    ],
    correctOptionId: "A",
    explanation:
      "Action groups are the Azure Monitor objects created once and reused across multiple alert rules for notifications and automation.",
  }),
];
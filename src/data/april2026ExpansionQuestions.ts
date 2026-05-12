import type {
  CaseStudy,
  ChoiceQuestion,
  DragDropQuestion,
  MultiSelectQuestion,
  Question,
  QuestionOption,
  YesNoQuestion,
} from "../types/exam";
import { ensurePromptComplexity } from "./questionComplexity.ts";
import { rebalanceChoiceOptionIds } from "./rebalanceChoiceOptionIds.ts";

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

export const april2026ExpansionCaseStudies: CaseStudy[] = [
  {
    id: "CS-ALPINE-BIORETAIL",
    companyName: "Alpine BioRetail",
    title: "Case Study: Multi-region governance and operations hardening",
    overview:
      "Alpine BioRetail runs regulated commerce workloads in Azure. The platform team is standardizing identity governance, resilient storage, controlled releases, private networking, and unified monitoring.",
    currentEnvironment: [
      "Production subscriptions are organized under a dedicated management group.",
      "Web applications run in App Service with frequent release cycles.",
      "Blob data is used for compliance exports.",
      "Spoke virtual networks host app and data workloads.",
      "Monitoring and backup are handled by separate operations teams.",
    ],
    plannedChanges: [
      "Use temporary elevation for privileged administrators.",
      "Improve storage regional readability and lifecycle controls.",
      "Adopt staged deployment and predictable autoscale behavior.",
      "Force private service access from app subnets.",
      "Standardize alert routing and recovery readiness reports.",
    ],
    requirements: [
      "Privileged access must be just-in-time and approval based.",
      "Compliance data must remain readable from a secondary region.",
      "Release operations must minimize production downtime.",
      "PaaS dependencies must be reachable over private IP only.",
      "Operations must centralize alerting and DR validation steps.",
    ],
    questionIds: ["Q2415", "Q2423", "Q2435", "Q2445", "Q2454"],
  },
];

export const april2026ExpansionQuestions: Question[] = [
  choiceQuestion({
    id: "Q2405",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Retail",
    scenario:
      "A helpdesk team must reset passwords for only users in the London office with audit compliance tracking and approval workflow requirements.",
    stem: "Which Microsoft Entra feature should you use to scope this delegation?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Administrative units",

    hint: "You need delegated admin over only a subset of directory users, not Azure resources. Choose the Entra construct that scopes user and group administration boundaries.",
    options: [
      option("A", "An administrative unit", "Administrative units scope delegated administration to a subset of directory objects."),
      option("B", "A management group", "Management groups scope Azure subscriptions, not Entra users."),
      option("C", "A resource group", "Resource groups scope Azure resources, not user objects."),
      option("D", "A budget", "Budgets track cost and do not scope user administration."),
    ],
    correctOptionId: "A",
    explanation:
      "Administrative units are the intended Entra feature for scoped user and group administration delegation.",
  }),
  choiceQuestion({
    id: "Q2406",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "A team needs to assign permissions to storage accounts in one resource group only.",
    stem: "Where should the RBAC role assignment be created for least privilege?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Assign roles at different scopes",

    hint: "Apply RBAC at the narrowest scope that still contains all required storage accounts. Avoid inheritance at broader scopes unless explicitly required.",
    options: [
      option("A", "At the resource group scope", "Resource-group scope limits permission inheritance to the required boundary."),
      option("B", "At the subscription scope", "Subscription scope is broader than required."),
      option("C", "At tenant root", "Tenant root is far broader than required."),
      option("D", "At management group root", "Management-group scope is broader than required."),
    ],
    correctOptionId: "A",
    explanation:
      "Role assignment should be created at the narrowest scope that still satisfies access requirements.",
  }),
  choiceQuestion({
    id: "Q2407",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Fabrikam Finance",
    scenario:
      "An owner assignment is permanent on a production subscription. Security policy requires time-bound activation with approval.",
    stem: "Which action satisfies this requirement?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Microsoft Entra PIM",

    hint: "The requirement is just-in-time, approval-gated elevation that removes standing privilege. MFA alone does not make a permanent assignment time-bound.",
    options: [
      option("A", "Convert to eligible role assignment in PIM and require approval", "Eligible assignment with approval enforces just-in-time elevation."),
      option("B", "Keep permanent owner and enable MFA", "MFA alone does not remove standing privilege."),
      option("C", "Assign Reader and allow self-assignment", "Reader does not satisfy operational ownership tasks."),
      option("D", "Apply a delete lock", "Locks protect resources, not privileged access activation."),
    ],
    correctOptionId: "A",
    explanation:
      "PIM eligible assignments plus approval enforce time-bound, controlled privilege activation.",
  }),
  choiceQuestion({
    id: "Q2408",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Woodgrove",
    scenario:
      "A pilot group should receive self-service password reset before tenant-wide rollout.",
    stem: "Which SSPR scope should be selected?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Configure SSPR",

    hint: "A phased rollout to a pilot cohort requires scoping SSPR to a specific subset first, rather than enabling it tenant-wide.",
    options: [
      option("A", "Selected groups", "Selected-groups scope is intended for phased rollout."),
      option("B", "All users", "All-users scope bypasses phased rollout."),
      option("C", "Guest users only", "Guest-only scope excludes internal pilot users."),
      option("D", "Disabled", "Disabled does not meet rollout objectives."),
    ],
    correctOptionId: "A",
    explanation:
      "SSPR supports selected-groups rollout for controlled adoption and validation.",
  }),
  choiceQuestion({
    id: "Q2409",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Litware",
    scenario:
      "All resources must include an Owner tag. Missing values should be added automatically where possible.",
    stem: "Which Azure Policy effect is appropriate?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Policy effects",

    hint: "The effect must not only detect drift but also write missing tag values during evaluation or remediation tasks.",
    options: [
      option("A", "Modify", "Modify can add or update tags during deployment and remediation."),
      option("B", "Audit", "Audit reports but does not change resource properties."),
      option("C", "Disabled", "Disabled turns off policy enforcement."),
      option("D", "Deny", "Deny blocks deployment instead of fixing missing tags."),
    ],
    correctOptionId: "A",
    explanation:
      "Modify is the effect used to stamp or correct tags automatically.",
  }),
  multiSelectQuestion({
    id: "Q2410",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "A. Datum",
    scenario:
      "You must block public IP creation and still report noncompliance for legacy resources.",
    stem: "Which two policy effects should you use?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Policy effects",

    hint: "Use one effect to block future noncompliant deployments and another to report existing noncompliant resources that are already present.",
    options: [
      option("A", "Deny", "Deny blocks new noncompliant deployments."),
      option("B", "Audit", "Audit reports existing noncompliant resources."),
      option("C", "Disabled", "Disabled disables evaluation and enforcement."),
      option("D", "Append", "Append adds fields but does not block disallowed resource types by itself."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Deny prevents new drift; Audit provides visibility into existing drift.",
  }),
  multiSelectQuestion({
    id: "Q2411",
    domain: "D1",
    type: "multi-select",
    difficulty: "hard",
    company: "Contoso Manufacturing",
    scenario:
      "A support team must invite external users and manage group membership, without Azure subscription administration.",
    stem: "Which two Entra roles fit these requirements?",
    subtopic: "Manage Microsoft Entra users and groups",
    referenceTopic: "Built-in Entra roles",

    hint: "Pick directory-scoped roles for guest invitation and group membership management, and avoid Azure RBAC roles that grant subscription resource control.",
    options: [
      option("A", "Guest Inviter", "Guest Inviter can invite external users."),
      option("B", "Groups Administrator", "Groups Administrator handles group creation and membership."),
      option("C", "Owner", "Owner is an Azure RBAC role with broad resource control."),
      option("D", "Billing Reader", "Billing Reader cannot manage users or group membership."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Guest Inviter and Groups Administrator provide required directory tasks without broad Azure resource permissions.",
  }),
  yesNoQuestion({
    id: "Q2412",
    domain: "D1",
    type: "yes-no",
    difficulty: "easy",
    company: "Tailwind",
    scenario: "You are reviewing governance statements.",
    stem: "For each statement, answer Yes if correct. Otherwise, answer No.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Management groups and locks",

    hint: "Validate each statement independently: management group assignments inherit downward, CanNotDelete blocks deletion not reads, and budgets can trigger threshold notifications.",
    statements: [
      { id: "S1", text: "A management group assignment is inherited by child subscriptions.", answer: "Yes" },
      { id: "S2", text: "A CanNotDelete lock prevents read operations.", answer: "No" },
      { id: "S3", text: "Budgets can trigger notifications on threshold crossing.", answer: "Yes" },
    ],
    explanation:
      "Management-group inheritance is supported, CanNotDelete does not block reads, and budgets can notify at thresholds.",
  }),
  dragDropQuestion({
    id: "Q2413",
    domain: "D1",
    type: "drag-drop",
    difficulty: "medium",
    company: "Alpine Ski House",
    scenario: "You are onboarding subscriptions into governed hierarchy.",
    stem: "Arrange the actions in the correct order.",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Management groups and policy assignment",

    hint: "The target hierarchy must exist before subscriptions can be moved into it, and inherited policy assignment comes after the scope structure is in place.",
    availableItems: [
      "Create management group",
      "Move subscription into management group",
      "Assign initiative at management group scope",
    ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: [
      "Create management group",
      "Move subscription into management group",
      "Assign initiative at management group scope",
    ],
    explanation:
      "Scope hierarchy must exist before subscriptions are moved, then policy can be assigned at inherited scope.",
  }),
  choiceQuestion({
    id: "Q2414",
    domain: "D1",
    type: "hot-area",
    difficulty: "hard",
    company: "Proseware",
    scenario:
      "A policy must apply only to production subscriptions grouped under one management group, ensuring dev/test subscriptions are excluded without broad exceptions.",
    stem: "At which scope should you assign the policy?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Policy assignment scopes",

    hint: "Scope the assignment high enough to cover all production subscriptions but not so high that it unintentionally includes nonproduction environments.",
    options: [
      option("A", "Tenant root group", "Tenant root affects unrelated environments."),
      option("B", "Production management group", "Production management group scopes policy to required subscriptions."),
      option("C", "One production resource group", "Resource-group scope is too narrow for all subscriptions."),
      option("D", "Single production VM", "VM scope is far too narrow."),
    ],
    correctOptionId: "B",
    explanation:
      "Assign policy at production management group to cover all production subscriptions only.",
  }),
  choiceQuestion({
    id: "Q2415",
    domain: "D1",
    type: "case-study",
    difficulty: "hard",
    company: "Alpine BioRetail",
    scenario:
      "Case study: Privileged administrators must activate access only when approved and for limited duration.",
    stem: "Which service and model should be used?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "Microsoft Entra PIM",

    hint: "The model must enforce approval and limited activation duration for privileged access, replacing permanent standing admin rights.",
    caseStudyId: "CS-ALPINE-BIORETAIL",
    options: [
      option("A", "PIM eligible assignment with approval and activation duration", "PIM eligible access provides approval-gated, time-bound elevation."),
      option("B", "Permanent Owner with MFA", "MFA does not remove standing privilege."),
      option("C", "Resource lock and budget", "These controls do not manage privileged activation."),
      option("D", "Guest accounts with Reader", "Reader is insufficient for admin operations."),
    ],
    correctOptionId: "A",
    explanation:
      "PIM eligible role assignments with approval best implement just-in-time privileged access.",
  }),

  choiceQuestion({
    id: "Q2416",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Logistics",
    scenario:
      "A partner needs temporary blob upload permission without sharing account keys.",
    stem: "Which SAS type should be used?",
    subtopic: "Configure access to storage",
    referenceTopic: "User delegation SAS",

    hint: "To avoid distributing account keys, use the SAS model signed through Microsoft Entra delegated identity rather than key-based signing.",
    options: [
      option("A", "User delegation SAS", "User delegation SAS uses Entra-based delegation instead of account keys."),
      option("B", "Account SAS", "Account SAS depends on account key signing."),
      option("C", "Service endpoint", "Service endpoints are network controls, not auth tokens."),
      option("D", "Private endpoint", "Private endpoints are connectivity controls, not SAS tokens."),
    ],
    correctOptionId: "A",
    explanation:
      "User delegation SAS is preferred when avoiding direct storage key use.",
  }),
  choiceQuestion({
    id: "Q2417",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Retail",
    scenario:
      "Blobs not modified for 90 days should move automatically to archive tier.",
    stem: "Which feature should be configured?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Lifecycle management",

    hint: "Look for the native blob policy engine that can move objects across access tiers automatically based on age or last modification conditions.",
    options: [
      option("A", "Lifecycle management policy", "Lifecycle management automates tier transitions and optional cleanup."),
      option("B", "Resource lock", "Locks do not move blob tiers."),
      option("C", "NSG", "NSGs do not apply storage tier transitions."),
      option("D", "Log Analytics workspace", "Log Analytics does not control blob tiering."),
    ],
    correctOptionId: "A",
    explanation:
      "Lifecycle management is designed for policy-based automatic tier transitions.",
  }),
  choiceQuestion({
    id: "Q2418",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Northwind",
    scenario:
      "A storage account must reject unencrypted HTTP requests.",
    stem: "Which setting should be enabled?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Secure transfer required",

    hint: "The requirement is transport security enforcement that rejects plain HTTP and allows only encrypted HTTPS requests.",
    options: [
      option("A", "Secure transfer required", "This enforces HTTPS-only access."),
      option("B", "Blob versioning", "Versioning does not enforce transport protocol."),
      option("C", "Soft delete", "Soft delete addresses recovery, not HTTPS enforcement."),
      option("D", "Change feed", "Change feed tracks changes and does not enforce HTTPS."),
    ],
    correctOptionId: "A",
    explanation:
      "Secure transfer required enforces HTTPS for storage endpoint requests.",
  }),
  choiceQuestion({
    id: "Q2419",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Woodgrove Bank",
    scenario:
      "Data must survive zone failure in primary region and still be readable in secondary region.",
    stem: "Which redundancy option is required?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Storage redundancy",

    hint: "You need both zonal resilience in the primary region and read access in the secondary region. Choose the SKU that combines both capabilities.",
    options: [
      option("A", "RA-GZRS", "RA-GZRS provides zone resilience plus readable secondary region endpoint."),
      option("B", "ZRS", "ZRS has no secondary region replica."),
      option("C", "GRS", "GRS does not provide read access to secondary by default."),
      option("D", "LRS", "LRS keeps data only in one region scope."),
    ],
    correctOptionId: "A",
    explanation:
      "RA-GZRS satisfies both zonal resilience and readable geo-replica requirements.",
  }),
  multiSelectQuestion({
    id: "Q2420",
    domain: "D2",
    type: "multi-select",
    difficulty: "medium",
    company: "Proseware",
    scenario:
      "You need recovery from blob delete and blob overwrite events.",
    stem: "Which two features should be enabled?",
    subtopic: "Configure Azure Files and Azure Blob Storage",
    referenceTopic: "Blob protection",

    hint: "One feature should recover deleted blobs, and the other should preserve prior blob states after updates or overwrites.",
    options: [
      option("A", "Blob soft delete", "Soft delete protects deleted blobs for a retention window."),
      option("B", "Blob versioning", "Versioning preserves previous states after updates."),
      option("C", "Service endpoint", "Service endpoint controls network path, not data recovery."),
      option("D", "Hot tier", "Tier choice is not a recovery mechanism."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Soft delete and versioning together cover delete and overwrite recovery scenarios.",
  }),
  yesNoQuestion({
    id: "Q2421",
    domain: "D2",
    type: "yes-no",
    difficulty: "medium",
    company: "Tailwind",
    scenario: "Review storage statements.",
    stem: "For each statement, answer Yes if correct. Otherwise, answer No.",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Redundancy and replication",

    hint: "Check three facts: ZRS is intra-region zonal replication, RA-GRS exposes readable secondary endpoints, and object replication targets block blobs rather than append blobs.",
    statements: [
      { id: "S1", text: "ZRS replicates across zones in one region.", answer: "Yes" },
      { id: "S2", text: "RA-GRS allows read access to secondary region replica.", answer: "Yes" },
      { id: "S3", text: "Object replication is for append blobs only.", answer: "No" },
    ],
    explanation:
      "ZRS is zonal in one region; RA-GRS offers readable secondary; object replication targets block blobs.",
  }),
  dragDropQuestion({
    id: "Q2422",
    domain: "D2",
    type: "drag-drop",
    difficulty: "medium",
    company: "Adventure Works",
    scenario: "You are setting up revocable SAS access.",
    stem: "Arrange the actions in the correct order.",
    subtopic: "Configure access to storage",
    referenceTopic: "Stored access policies",

    hint: "A SAS cannot reference a stored access policy until that policy exists. Create governance controls first, then mint and distribute the token.",
    availableItems: [
      "Create stored access policy",
      "Generate SAS linked to policy",
      "Provide SAS to application",
    ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: [
      "Create stored access policy",
      "Generate SAS linked to policy",
      "Provide SAS to application",
    ],
    explanation:
      "Policy must exist before SAS creation; then SAS can be distributed.",
  }),
  choiceQuestion({
    id: "Q2423",
    domain: "D2",
    type: "case-study",
    difficulty: "medium",
    company: "Alpine BioRetail",
    scenario:
      "Case study: Compliance exports must remain readable from secondary region during drills.",
    stem: "Which storage redundancy should be selected?",
    subtopic: "Configure and manage storage accounts",
    referenceTopic: "Storage redundancy",

    hint: "Select the redundancy tier that offers secondary-region readability while also preserving zone-level resilience in the primary region.",
    caseStudyId: "CS-ALPINE-BIORETAIL",
    options: [
      option("A", "RA-GZRS", "RA-GZRS includes readable secondary region and primary zonal resilience."),
      option("B", "ZRS", "ZRS lacks secondary region copy."),
      option("C", "LRS", "LRS has no regional redundancy."),
      option("D", "GRS", "GRS secondary is not readable by default."),
    ],
    correctOptionId: "A",
    explanation:
      "RA-GZRS is the only listed option that meets both readability and zonal requirements.",
  }),

  choiceQuestion({
    id: "Q2424",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Engineering",
    scenario:
      "A VM must authenticate to Key Vault without storing secrets in code.",
    stem: "Which VM capability should be enabled?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Managed identities",

    hint: "The workload needs token-based authentication to Key Vault without embedding credentials. Enable the VM identity feature designed for this pattern.",
    options: [
      option("A", "System-assigned managed identity", "Managed identity provides token-based auth without embedded secrets."),
      option("B", "Public IP", "Public IP does not provide identity or auth tokens."),
      option("C", "NSG", "NSG filters network traffic but does not authenticate workload."),
      option("D", "Azure Bastion", "Bastion provides admin connectivity, not workload auth."),
    ],
    correctOptionId: "A",
    explanation:
      "Managed identity is the standard Azure pattern for secretless workload authentication.",
  }),
  choiceQuestion({
    id: "Q2425",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Litware Apps",
    scenario:
      "A new App Service release must be validated before production cutover.",
    stem: "Which App Service feature should be used?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Deployment slots",

    hint: "Use the feature that supports pre-production validation with warm-up and controlled swap into production to minimize release risk.",
    options: [
      option("A", "Deployment slot", "Deployment slots support staged validation and controlled swap."),
      option("B", "Resource lock", "Locks do not provide staged release mechanisms."),
      option("C", "Availability set", "Availability sets apply to VMs, not App Service deployment flow."),
      option("D", "Recovery Services vault", "Vaults provide backup and DR, not staged web releases."),
    ],
    correctOptionId: "A",
    explanation:
      "Deployment slots minimize risk and downtime through warm-up and swap workflow.",
  }),
  choiceQuestion({
    id: "Q2426",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Northwind",
    scenario:
      "A VMSS update must ensure no more than 20 percent of instances are updated at once.",
    stem: "Which upgrade strategy should be configured?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "VMSS rolling upgrades",

    hint: "The requirement sets a strict concurrency ceiling for updates. Choose the policy that applies updates in bounded batches using a maximum percentage.",
    options: [
      option("A", "Rolling upgrade policy with max batch 20%", "Rolling policy supports controlled batch updates to protect availability."),
      option("B", "Automatic without batch limit", "Automatic alone may update too many instances at once."),
      option("C", "Manual with random updates", "Manual random updates do not enforce deterministic batch constraints."),
      option("D", "Reimage all instances simultaneously", "Simultaneous reimage violates availability requirement."),
    ],
    correctOptionId: "A",
    explanation:
      "Rolling upgrades with explicit max batch percentage limit disruption.",
  }),
  choiceQuestion({
    id: "Q2427",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Fabrikam",
    scenario:
      "You need to run a one-time Linux container job for 45 minutes without cluster management.",
    stem: "Which Azure service is best fit?",
    subtopic: "Provision and manage containers",
    referenceTopic: "Azure Container Instances",

    hint: "For a short-lived, one-time container job with no orchestrator overhead, prefer the serverless container execution service.",
    options: [
      option("A", "Azure Container Instances", "ACI is optimized for simple, serverless container execution."),
      option("B", "AKS", "AKS introduces cluster-management overhead not needed here."),
      option("C", "Dedicated host", "Dedicated host is for VM placement, not lightweight one-off jobs."),
      option("D", "App Service Plan only", "App Service Plan does not directly run standalone container jobs without app model."),
    ],
    correctOptionId: "A",
    explanation:
      "ACI provides fast, low-overhead execution for short-lived container workloads.",
  }),
  choiceQuestion({
    id: "Q2428",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Wingtip",
    scenario:
      "An App Service app needs autoscale based on CPU threshold.",
    stem: "Which control enables this behavior?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "App Service autoscale",

    hint: "Autoscale is configured at the hosting plan level where metric-based rules add or remove instances as CPU thresholds are crossed.",
    options: [
      option("A", "Autoscale rule on App Service plan", "Plan autoscale controls instance count based on metrics."),
      option("B", "Budget alert", "Budgets track cost and do not scale workloads."),
      option("C", "Management group", "Management groups are governance hierarchy, not scaling controls."),
      option("D", "Route table", "Route tables influence networking, not compute scale."),
    ],
    correctOptionId: "A",
    explanation:
      "App Service plan autoscale is the correct mechanism for metric-based horizontal scaling.",
  }),
  choiceQuestion({
    id: "Q2429",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "A. Datum",
    scenario:
      "A custom VM image must be versioned and replicated to multiple regions for standardized deployment.",
    stem: "Which Azure service should host these images?",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Azure Compute Gallery",

    hint: "The requirement is image versioning plus replication across regions for standardized VM deployments. Use the purpose-built shared image distribution service.",
    options: [
      option("A", "Azure Compute Gallery", "Compute Gallery supports versioning and cross-region image replication."),
      option("B", "Load Balancer", "Load Balancer does not store VM images."),
      option("C", "Log Analytics", "Log Analytics stores telemetry, not VM image versions."),
      option("D", "DNS zone", "DNS zones provide naming, not image lifecycle management."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Compute Gallery is purpose-built for image versioning and replication.",
  }),
  multiSelectQuestion({
    id: "Q2430",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Coho Winery",
    scenario:
      "An App Service app must read secrets from Key Vault without stored credentials.",
    stem: "Which two steps are required?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Managed identity and Key Vault",

    hint: "Enable a managed identity for the app first, then grant only secret read access in Key Vault; identity and permission are both required.",
    options: [
      option("A", "Enable managed identity on App Service", "Managed identity provides token-based identity for app workload."),
      option("B", "Grant the identity secret read permissions in Key Vault", "Key Vault permissions must allow secret retrieval."),
      option("C", "Disable HTTPS", "Disabling HTTPS weakens security and is unrelated."),
      option("D", "Assign Owner at subscription", "Owner is excessive and unnecessary for secret read."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Managed identity plus least-privilege Key Vault authorization enables secure secret retrieval.",
  }),
  multiSelectQuestion({
    id: "Q2431",
    domain: "D3",
    type: "multi-select",
    difficulty: "hard",
    company: "Southridge Video",
    scenario:
      "A private ACR should be used by Container Apps without admin credentials.",
    stem: "Which two actions implement this securely?",
    subtopic: "Provision and manage containers",
    referenceTopic: "ACR and managed identity",

    hint: "Use managed identity for the container app and assign AcrPull on the registry to avoid storing admin credentials.",
    options: [
      option("A", "Assign managed identity to container app", "Managed identity avoids embedded credentials."),
      option("B", "Grant AcrPull role to that identity on ACR", "AcrPull grants minimum image-pull permission."),
      option("C", "Enable anonymous pull", "Anonymous pull reduces security posture."),
      option("D", "Store admin password in plain app setting", "Plain credential storage is insecure and unnecessary."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Managed identity plus AcrPull role is the secure standard for registry pulls.",
  }),
  yesNoQuestion({
    id: "Q2432",
    domain: "D3",
    type: "yes-no",
    difficulty: "medium",
    company: "Contoso",
    scenario: "You are evaluating compute statements.",
    stem: "For each statement, answer Yes if correct. Otherwise, answer No.",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "Availability and containers",

    hint: "Remember: availability zones are in-region resilience boundaries, Spot VMs can be evicted, and Container Apps supports revisions.",
    statements: [
      { id: "S1", text: "Availability zones protect against a single datacenter outage in-region.", answer: "Yes" },
      { id: "S2", text: "Spot VMs are guaranteed to never be evicted.", answer: "No" },
      { id: "S3", text: "Container Apps supports revision-based deployment model.", answer: "Yes" },
    ],
    explanation:
      "Availability zones are zonal resilience boundaries, Spot VMs can be evicted, and Container Apps supports revisions.",
  }),
  dragDropQuestion({
    id: "Q2433",
    domain: "D3",
    type: "drag-drop",
    difficulty: "hard",
    company: "Litware",
    scenario: "You are publishing image-based VM deployments with Azure Compute Gallery.",
    stem: "Arrange the workflow in correct order.",
    subtopic: "Create and configure virtual machines",
    referenceTopic: "Azure Compute Gallery workflow",

    hint: "Compute Gallery is hierarchical: create gallery, then image definition, then image version, and deploy VMs from the version.",
    availableItems: [
      "Create gallery",
      "Create image definition",
      "Create image version",
      "Deploy VM from image version",
    ],
    answerSlots: ["Step 1", "Step 2", "Step 3", "Step 4"],
    correctOrder: [
      "Create gallery",
      "Create image definition",
      "Create image version",
      "Deploy VM from image version",
    ],
    explanation:
      "Gallery object contains definitions, which contain versions used for deployment.",
  }),
  choiceQuestion({
    id: "Q2434",
    domain: "D3",
    type: "hot-area",
    difficulty: "medium",
    company: "Proseware",
    scenario:
      "A containerized HTTP API needs revisions, managed ingress, and scale to zero.",
    stem: "Which Azure service should be selected?",
    subtopic: "Provision and manage containers",
    referenceTopic: "Azure Container Apps",

    hint: "If you need revisions, managed ingress, and scale-to-zero for containerized HTTP apps, Azure Container Apps is the fit.",
    options: [
      option("A", "Azure Container Apps", "Container Apps supports revisions, ingress, and scale-to-zero."),
      option("B", "Availability set", "Availability sets are VM resiliency constructs."),
      option("C", "Route table", "Route table is not a container hosting service."),
      option("D", "Recovery Services vault", "Vaults are for backup/DR, not app hosting."),
    ],
    correctOptionId: "A",
    explanation:
      "Container Apps is aligned with managed HTTP container workloads and scale-to-zero.",
  }),
  choiceQuestion({
    id: "Q2435",
    domain: "D3",
    type: "case-study",
    difficulty: "medium",
    company: "Alpine BioRetail",
    scenario:
      "Case study: Web release process must minimize downtime and allow pre-production validation.",
    stem: "Which App Service feature should be implemented?",
    subtopic: "Create and configure Azure App Service",
    referenceTopic: "Deployment slots",

    hint: "Use deployment slots to validate and warm up a release before swap, minimizing production downtime.",
    caseStudyId: "CS-ALPINE-BIORETAIL",
    options: [
      option("A", "Deployment slots with swap", "Slots support warm-up, validation, and low-downtime cutover."),
      option("B", "Stop and redeploy production", "Stop/redeploy increases downtime risk."),
      option("C", "Budget alert", "Budgeting does not control release mechanics."),
      option("D", "Read-only lock", "Locking does not provide staged deployment flow."),
    ],
    correctOptionId: "A",
    explanation:
      "Deployment slots are the standard low-risk App Service release pattern.",
  }),

  choiceQuestion({
    id: "Q2436",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso",
    scenario:
      "Two VNets in the same region require private connectivity over Microsoft backbone.",
    stem: "Which feature should be configured?",
    subtopic: "Configure and manage virtual networks",
    referenceTopic: "VNet peering",

    hint: "For private, low-latency connectivity between VNets over the Microsoft backbone, configure VNet peering.",
    options: [
      option("A", "VNet peering", "VNet peering enables low-latency private connectivity between VNets."),
      option("B", "Public load balancer", "Load balancer does not connect two VNets."),
      option("C", "Budget", "Budget is unrelated to networking connectivity."),
      option("D", "Recovery vault", "Recovery vault does not provide VNet connectivity."),
    ],
    correctOptionId: "A",
    explanation:
      "VNet peering is the Azure-native way to interconnect VNets privately.",
  }),
  choiceQuestion({
    id: "Q2437",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam",
    scenario:
      "Subnet workloads need fixed outbound public IP addresses.",
    stem: "Which subnet-associated resource provides this behavior?",
    subtopic: "Configure and manage virtual networks",
    referenceTopic: "NAT Gateway",

    hint: "NAT Gateway gives a subnet predictable outbound public IP addresses and scales SNAT better than instance-level outbound.",
    options: [
      option("A", "NAT Gateway", "NAT Gateway gives predictable outbound IP addresses for subnet traffic."),
      option("B", "Private DNS zone", "Private DNS resolves names and does not assign outbound IP."),
      option("C", "Application Gateway", "Application Gateway handles inbound L7 traffic, not subnet outbound SNAT."),
      option("D", "Management group", "Management groups do not control subnet egress behavior."),
    ],
    correctOptionId: "A",
    explanation:
      "NAT Gateway is purpose-built for stable outbound egress IP from a subnet.",
  }),
  choiceQuestion({
    id: "Q2438",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind",
    scenario:
      "Operations must reach VMs over SSH or RDP without VM public IP addresses.",
    stem: "Which service should be used?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Azure Bastion",

    hint: "Choose Azure Bastion to reach private VMs over SSH/RDP without assigning public IP addresses to those VMs.",
    options: [
      option("A", "Azure Bastion", "Bastion provides secure browser/native tunneled admin access without VM public IPs."),
      option("B", "Azure DNS", "DNS does not provide admin session connectivity."),
      option("C", "Route table", "Route tables guide traffic but do not provide remote access service."),
      option("D", "Load balancer", "Load balancers distribute app traffic, not admin sessions."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Bastion is the secure remote administration service for private VMs.",
  }),
  choiceQuestion({
    id: "Q2439",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Woodgrove",
    scenario:
      "A storage account should remain on public endpoint but allow only selected subnets over Microsoft backbone.",
    stem: "Which feature should be configured on the subnet and storage firewall model?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Service endpoints",

    hint: "Use service endpoints when you keep the PaaS public endpoint but restrict access to selected trusted subnets.",
    options: [
      option("A", "Service endpoint", "Service endpoint keeps public endpoint while extending trusted subnet identity."),
      option("B", "Private endpoint", "Private endpoint uses private IP path, not public endpoint model."),
      option("C", "Public load balancer", "Load balancer is unrelated to storage firewall subnet trust."),
      option("D", "Action group", "Action groups are for alerts."),
    ],
    correctOptionId: "A",
    explanation:
      "Service endpoints are used for restricted public-endpoint PaaS access from trusted subnets.",
  }),
  choiceQuestion({
    id: "Q2440",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "easy",
    company: "A. Datum",
    scenario:
      "A regulated finance line-of-business app must enforce private-only access inside VNet and connected private networks per compliance mandate.",
    stem: "Which load balancer type is appropriate?",
    subtopic: "Configure name resolution and load balancing",
    referenceTopic: "Internal load balancer",

    hint: "Internal Load Balancer exposes a private frontend only, so traffic stays within VNets and connected private networks.",
    options: [
      option("A", "Internal Load Balancer", "Internal LB exposes private frontend IP for internal clients only."),
      option("B", "Public Load Balancer", "Public LB exposes service on internet-reachable frontend."),
      option("C", "Public IP prefix", "Public IP prefix allocates addresses and does not perform balancing."),
      option("D", "Traffic Manager", "Traffic Manager is DNS-based global routing, not private in-VNet LB endpoint."),
    ],
    correctOptionId: "A",
    explanation:
      "Internal load balancer keeps service exposure private within connected networks.",
  }),
  choiceQuestion({
    id: "Q2446",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Proseware",
    scenario:
      "A VM backend in Standard Load Balancer remains unhealthy due to subnet NSG configuration.",
    stem: "Which NSG allow rule is commonly required for health probes?",
    subtopic: "Configure name resolution and load balancing",
    referenceTopic: "Troubleshoot load balancing",

    hint: "If Standard Load Balancer probes fail, verify NSG allows inbound from the AzureLoadBalancer service tag.",
    options: [
      option("A", "Allow AzureLoadBalancer service tag inbound", "Health probes originate from AzureLoadBalancer and must be permitted."),
      option("B", "Allow Internet outbound", "Probe issue is inbound validation, not outbound internet egress."),
      option("C", "Allow any from VirtualNetwork only", "VirtualNetwork tag does not specifically cover probe source requirement in all cases."),
      option("D", "Deny all with lower priority", "Deny-all would continue to block probes."),
    ],
    correctOptionId: "A",
    explanation:
      "Allowing AzureLoadBalancer probe traffic is a common prerequisite for healthy backend status.",
  }),
  multiSelectQuestion({
    id: "Q2441",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Tailwind",
    scenario:
      "You want scalable NSG rules that target logical groups of NICs and Azure service ranges.",
    stem: "Which two features should you use?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "NSGs and ASGs",

    hint: "Use Application Security Groups to target workloads and service tags to avoid hard-coding Azure service IP ranges.",
    options: [
      option("A", "Application security groups", "ASGs let you target NSG rules by workload grouping."),
      option("B", "Service tags", "Service tags simplify Azure service destination/source ranges."),
      option("C", "Recovery Services vault", "Vaults are not packet-filtering constructs."),
      option("D", "Budget", "Budget does not define packet-filtering semantics."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "ASGs and service tags reduce rule sprawl and improve maintainability.",
  }),
  multiSelectQuestion({
    id: "Q2442",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Contoso",
    scenario:
      "Private endpoint DNS names must resolve from a consuming VNet.",
    stem: "Which two actions are required?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Private endpoint DNS",

    hint: "Private endpoint name resolution needs both the correct private DNS zone and a VNet link to the consuming network.",
    options: [
      option("A", "Create proper private DNS zone", "Private DNS zone hosts endpoint name records."),
      option("B", "Link private DNS zone to consuming VNet", "VNet link enables clients to resolve private records."),
      option("C", "Create public IP for endpoint", "Private endpoints do not require public IPs."),
      option("D", "Enable anonymous access", "Anonymous access does not influence private DNS resolution."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Private DNS zone plus VNet link is required for private endpoint name resolution.",
  }),
  yesNoQuestion({
    id: "Q2443",
    domain: "D4",
    type: "yes-no",
    difficulty: "medium",
    company: "Litware",
    scenario: "Review networking statements.",
    stem: "For each statement, answer Yes if correct. Otherwise, answer No.",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Private endpoints and NSG",

    hint: "Private endpoints map services to private IPs, while service endpoints do not; NSGs can be applied at subnet and NIC.",
    statements: [
      { id: "S1", text: "A private endpoint uses a private IP from your VNet.", answer: "Yes" },
      { id: "S2", text: "A service endpoint assigns a private IP to the PaaS resource in your subnet.", answer: "No" },
      { id: "S3", text: "NSGs can be associated with subnet and NIC scopes.", answer: "Yes" },
    ],
    explanation:
      "Private endpoints create private IP mapping, service endpoints do not, and NSGs attach at subnet or NIC.",
  }),
  dragDropQuestion({
    id: "Q2444",
    domain: "D4",
    type: "drag-drop",
    difficulty: "medium",
    company: "Adventure Works",
    scenario: "You are configuring subnet traffic steering through a firewall VM.",
    stem: "Arrange the actions in correct order.",
    subtopic: "Configure and manage virtual networks",
    referenceTopic: "User-defined routes",

    hint: "Create the route table, add the custom route and next hop, then associate the table with the target subnet.",
    availableItems: [
      "Create route table",
      "Add route with virtual appliance next hop",
      "Associate route table with subnet",
    ],
    answerSlots: ["Step 1", "Step 2", "Step 3"],
    correctOrder: [
      "Create route table",
      "Add route with virtual appliance next hop",
      "Associate route table with subnet",
    ],
    explanation:
      "Route table and route must exist before association applies behavior to subnet.",
  }),
  choiceQuestion({
    id: "Q2445",
    domain: "D4",
    type: "case-study",
    difficulty: "hard",
    company: "Alpine BioRetail",
    scenario:
      "Case study: PaaS dependencies must be consumed from app subnet via private IP only.",
    stem: "Which networking feature should be selected?",
    subtopic: "Configure secure access to virtual networks",
    referenceTopic: "Private endpoints",

    hint: "When a PaaS service must be consumed over private IP only, use a private endpoint instead of a service endpoint.",
    caseStudyId: "CS-ALPINE-BIORETAIL",
    options: [
      option("A", "Private endpoint", "Private endpoint maps service to private IP in VNet."),
      option("B", "Service endpoint", "Service endpoint keeps public service endpoint model."),
      option("C", "Public load balancer", "Load balancer does not provide private PaaS service mapping."),
      option("D", "Route table only", "Route tables alone do not create private endpoint mapping."),
    ],
    correctOptionId: "A",
    explanation:
      "Private endpoints are required when service access must use private IP path only.",
  }),

  choiceQuestion({
    id: "Q2447",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso",
    scenario:
      "You need to run KQL queries against centralized operational logs.",
    stem: "Which Azure resource stores and serves this queryable log data?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Log Analytics workspace",

    hint: "KQL queries run against data in a Log Analytics workspace, which is Azure Monitor's central log store.",
    options: [
      option("A", "Log Analytics workspace", "Log Analytics workspace stores logs and supports KQL querying."),
      option("B", "Route table", "Route tables control networking and do not store logs."),
      option("C", "NSG", "NSGs enforce packet filtering and do not host KQL datasets."),
      option("D", "Budget", "Budgets track costs, not operational telemetry."),
    ],
    correctOptionId: "A",
    explanation:
      "Log Analytics workspace is the core data platform for Azure Monitor log queries.",
  }),
  choiceQuestion({
    id: "Q2448",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam",
    scenario:
      "An alert should evaluate VM CPU > 80 percent for 10 minutes.",
    stem: "Which alert type should be created?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Metric alerts",

    hint: "For CPU percentage thresholds over a time window, use a metric alert rule rather than logs, policy, or cost alerts.",
    options: [
      option("A", "Metric alert rule", "Metric alerts evaluate platform metrics over time windows."),
      option("B", "Budget alert", "Budget alerts are cost-threshold notifications."),
      option("C", "Resource lock", "Resource locks do not evaluate telemetry."),
      option("D", "Policy initiative", "Policy initiative governs configuration compliance, not near real-time metric thresholds."),
    ],
    correctOptionId: "A",
    explanation:
      "Metric alert rules are used for threshold-based metric evaluation.",
  }),
  choiceQuestion({
    id: "Q2449",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Northwind",
    scenario:
      "Alert notifications must be suppressed during approved maintenance windows without changing alert logic.",
    stem: "Which Azure Monitor feature should be used?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Alert processing rules",

    hint: "Use alert processing rules to suppress or reroute notifications on a schedule without changing detection logic.",
    options: [
      option("A", "Alert processing rule", "Alert processing rules can suppress or reroute actions during windows."),
      option("B", "Disable alert rule", "Disabling alert rule removes detection entirely."),
      option("C", "Delete action group", "Deleting action groups is destructive and not schedule-aware suppression."),
      option("D", "Resource lock", "Resource locks do not control alert action processing."),
    ],
    correctOptionId: "A",
    explanation:
      "Alert processing rules are designed for time-bound suppression and routing behavior.",
  }),
  choiceQuestion({
    id: "Q2450",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Woodgrove",
    scenario:
      "Woodgrove Bank's mission-critical trading VM (currently in primary region) requires orchestrated regional failover with less-than-1-hour RTO and monthly non-disruptive DR drills.",
    stem: "Which service supports this requirement?",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Azure Site Recovery",

    hint: "Azure Site Recovery provides replication, planned and unplanned failover, and non-disruptive test failover drills.",
    options: [
      option("A", "Azure Site Recovery", "Site Recovery provides replication, failover orchestration, and test failover."),
      option("B", "Azure Bastion", "Bastion provides secure administration access, not DR orchestration."),
      option("C", "Application Gateway", "Application Gateway is an L7 load balancer, not replication/failover service."),
      option("D", "Azure DNS", "DNS alone does not provide VM replication and failover orchestration."),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Site Recovery is the platform service for VM disaster recovery workflows.",
  }),
  multiSelectQuestion({
    id: "Q2451",
    domain: "D5",
    type: "multi-select",
    difficulty: "hard",
    company: "A. Datum",
    scenario:
      "A monitoring design needs reusable notifications and optional automation invocation when alerts fire.",
    stem: "Which two Azure Monitor constructs are required?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Action groups and alert rules",

    hint: "Alert rules detect conditions; action groups define reusable notification and automation targets when alerts fire.",
    options: [
      option("A", "Action group", "Action groups define notification and action destinations."),
      option("B", "Alert rule", "Alert rules define detection logic that triggers actions."),
      option("C", "Resource lock", "Locks do not define notifications or remediation actions."),
      option("D", "Policy exemption", "Policy exemption is governance metadata, not alerting workflow."),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Alert rule handles detection and action group handles response destinations.",
  }),
  yesNoQuestion({
    id: "Q2452",
    domain: "D5",
    type: "yes-no",
    difficulty: "easy",
    company: "Tailwind",
    scenario: "Review backup and monitoring statements.",
    stem: "For each statement, answer Yes if correct. Otherwise, answer No.",
    subtopic: "Implement backup and recovery",
    referenceTopic: "Backup and monitoring",

    hint: "VM backups use Recovery Services vaults, Connection Monitor is for network checks, and ASR test failover does not stop replication.",
    statements: [
      { id: "S1", text: "Azure VM backup uses a Recovery Services vault.", answer: "Yes" },
      { id: "S2", text: "Connection Monitor is used to set backup retention policy.", answer: "No" },
      { id: "S3", text: "A Site Recovery test failover can run without stopping replication.", answer: "Yes" },
    ],
    explanation:
      "VM backup uses Recovery Services vault, Connection Monitor is network diagnostics, and ASR supports test failover.",
  }),
  yesNoQuestion({
    id: "Q2453",
    domain: "D5",
    type: "yes-no",
    difficulty: "medium",
    company: "Proseware",
    scenario: "Review Azure Monitor and action handling statements.",
    stem: "For each statement, answer Yes if correct. Otherwise, answer No.",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Azure Monitor",

    hint: "Scheduled query alerts use KQL, action groups are reusable, and alert processing rules do not alter metric collection cadence.",
    statements: [
      { id: "S1", text: "KQL queries in Log Analytics can be used by scheduled query alerts.", answer: "Yes" },
      { id: "S2", text: "Action groups can be reused by multiple alert rules.", answer: "Yes" },
      { id: "S3", text: "Alert processing rules change metric collection frequency.", answer: "No" },
    ],
    explanation:
      "Scheduled query alerts can use KQL, action groups are reusable, and alert processing rules do not alter collection cadence.",
  }),
  choiceQuestion({
    id: "Q2454",
    domain: "D5",
    type: "case-study",
    difficulty: "hard",
    company: "Alpine BioRetail",
    scenario:
      "Case study: Operations needs centralized alert routing and recurring DR validation with minimal disruption.",
    stem: "Which paired approach best satisfies the requirement?",
    subtopic: "Monitor resources in Azure",
    referenceTopic: "Action groups and Site Recovery test failover",

    hint: "Pair action groups for centralized alert routing with ASR test failover for recurring, non-disruptive DR validation.",
    caseStudyId: "CS-ALPINE-BIORETAIL",
    options: [
      option("A", "Use action groups for alert routing and ASR test failover for DR validation", "This combines reusable alert actions with non-disruptive DR validation."),
      option("B", "Use budgets and resource locks", "Budgets and locks do not validate disaster recovery paths."),
      option("C", "Use NSGs and route tables", "Network controls do not provide alert routing or DR test workflows."),
      option("D", "Use only service health alerts", "Service health alone does not validate workload failover readiness."),
    ],
    correctOptionId: "A",
    explanation:
      "Action groups standardize alert response routing, and Site Recovery test failover validates DR readiness without production disruption.",
  }),
];

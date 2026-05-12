import type {
  ChoiceQuestion,
  DragDropQuestion,
  MultiSelectQuestion,
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

// ============================================================================
// D5: MONITORING & BACKUP (Q2500–Q2507) - 8 questions
// ============================================================================

export const mayExpansionQuestions = [
  choiceQuestion({
    id: "Q2500",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Contoso Manufacturing",
    scenario:
      "Your operations team is setting up Application Insights for a web application. You want to collect telemetry without modifying application code.",
    stem: "Which Application Insights instrumentation method should you use?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Application Insights auto-instrumentation",

    hint: "Use codeless auto-instrumentation when telemetry is required without touching application code.",
    options: [
      option(
        "A",
        "Codeless attach via Agent",
        "Codeless attach (auto-instrumentation) enables telemetry collection without code changes, suitable for brownfield applications.",
      ),
      option(
        "B",
        "SDK-based instrumentation",
        "SDK instrumentation requires modifying application code, contradicting the no-code requirement.",
      ),
      option(
        "C",
        "Performance Counter diagnostics only",
        "Performance counters provide system metrics but not application-level telemetry.",
      ),
      option(
        "D",
        "Event Hubs streaming to Application Insights",
        "Event Hubs is an ingestion path but does not auto-instrument without code.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Application Insights auto-instrumentation (codeless attach) collects telemetry from web applications without code modification. It attaches via environment variables and startup hooks on App Service, Azure Kubernetes Service (AKS), and other managed compute platforms.",
  }),

  choiceQuestion({
    id: "Q2501",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "You are setting up Azure Monitor metric alerts for CPU usage. The baseline CPU is 40%, with occasional spikes to 60%. You want to alert only when sustained high usage occurs, not on brief spikes.",
    stem: "Which alert rule configuration prevents false positives from brief spikes?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Azure Monitor metric alerts with dynamic thresholds",

    hint: "Dynamic thresholds learn baseline behavior and the Medium operator needs sustained violations before alerting.",
    options: [
      option(
        "A",
        "Static threshold with high sensitivity",
        "Static threshold with high sensitivity would trigger on brief spikes, causing false positives.",
      ),
      option(
        "B",
        "Dynamic threshold with the Medium operator",
        "Dynamic thresholds learn baseline behavior and alert only on significant anomalies. The Medium operator requires 3 violations of 5 preceding periods, filtering noise.",
      ),
      option(
        "C",
        "Static threshold with aggregation granularity of 5 minutes",
        "Aggregation granularity smooths the window but does not distinguish sustained vs. transient spikes.",
      ),
      option(
        "D",
        "Alert whenever metric exceeds 50%",
        "A static 50% threshold would still trigger on brief transient spikes.",
      ),
    ],
    correctOptionId: "B",
    explanation:
      "Dynamic thresholds in Azure Monitor learn baseline patterns and calculate anomaly bands. The Medium operator requires violations in at least 3 of the last 5 aggregation periods, filtering out transient spikes while detecting sustained elevated usage. This reduces false positives compared to static thresholds.",
  }),

  multiSelectQuestion({
    id: "Q2502",
    domain: "D5",
    type: "multi-select",
    difficulty: "medium",
    company: "Fabrikam Health Services",
    scenario:
      "You must route critical alerts to an on-call engineer via SMS and simultaneously suppress duplicate alerts for 30 minutes.",
    stem: "Which two Azure Monitor components should you configure?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Action Groups and Alert Rules",

    hint: "Use an Action Group for routing notifications and combine it with suppression to reduce duplicate alert noise.",
    options: [
      option(
        "A",
        "Action Group with SMS notification",
        "Action Groups define notification channels (SMS, email, webhook). SMS is one such channel.",
      ),
      option(
        "B",
        "Alert suppression rule with a 30-minute duration",
        "Alert suppression rules prevent duplicate notifications within a specified time window.",
      ),
      option(
        "C",
        "Diagnostic Setting with Azure Sentinel",
        "Diagnostic Settings stream logs to storage or Log Analytics; Azure Sentinel is a SIEM, not an alert deduplication mechanism.",
      ),
      option(
        "D",
        "Auto-scale rule with notification",
        "Auto-scale rules trigger compute scaling; they do not handle alert routing or suppression.",
      ),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Action Groups attach notification channels (SMS, email, webhook, etc.) to alert rules. Alert suppression rules prevent duplicate notifications from the same source within a specified duration. Combined, they enable intelligent alert routing with noise reduction.",
  }),

  yesNoQuestion({
    id: "Q2503",
    domain: "D5",
    type: "yes-no",
    difficulty: "easy",
    company: "Litware",
    scenario:
      "You want to monitor Azure Storage account deletion events in Azure Monitor Logs. You configure a Diagnostic Setting on the storage account.",
    stem: "Will a Diagnostic Setting capture storage account deletion events?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Azure Monitor Diagnostic Settings and resource logs",

    hint: "Resource Diagnostic Settings capture data-plane logs, while resource deletion is a control-plane event in Activity Log.",
    statements: [
      {
        id: "A",
        text: "Yes, Diagnostic Settings capture all control-plane events including deletions.",
        answer: "No",
      },
      {
        id: "B",
        text: "No, Diagnostic Settings capture only data-plane logs (requests, performance). Deletion events are control-plane and must be captured via Activity Log.",
        answer: "Yes",
      },
    ],
    explanation:
      "Diagnostic Settings on resources capture data-plane activity logs (read, write, delete operations on data within the resource). Control-plane events (resource creation, deletion, configuration changes) are captured in the Azure Activity Log, not resource-level Diagnostic Settings. To monitor storage account deletions, query the Activity Log in Log Analytics.",
  }),

  choiceQuestion({
    id: "Q2504",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Alpine Ski House",
    scenario:
      "Your organization runs a regulated trading platform in Azure. Financial regulations require that transaction logs be recoverable from a secondary region even if the primary region fails. Data must not be recoverable after 7 years. You are designing a backup strategy.",
    stem: "Which backup vault redundancy and retention configuration satisfies these requirements?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Azure Backup vault redundancy and retention policies",

    hint: "Choose geo-redundant backup storage for regional failure recovery, then align retention exactly to the compliance window.",
    options: [
      option(
        "A",
        "LRS with 7-year retention",
        "LRS (Locally Redundant Storage) keeps copies in a single region. If the primary region fails, the vault itself is unavailable.",
      ),
      option(
        "B",
        "GRS with 7-year retention",
        "GRS (Geo-Redundant Storage) replicates backup data to a secondary region. This ensures regional failover. Seven-year retention meets the compliance window.",
      ),
      option(
        "C",
        "ZRS with indefinite retention",
        "ZRS is zone-redundant within a single region and does not provide regional failover. Indefinite retention violates the 7-year purge requirement.",
      ),
      option(
        "D",
        "RA-GRS with 3-year retention",
        "RA-GRS provides read access to the secondary region but 3-year retention falls short of the 7-year regulatory requirement.",
      ),
    ],
    correctOptionId: "B",
    explanation:
      "GRS (Geo-Redundant Storage) synchronously replicates backup data to a secondary region, enabling recovery if the primary region becomes unavailable. A 7-year retention policy ensures compliance data is maintained for the regulatory period and automatically purged afterward. LRS is insufficient for regional disasters; RA-GRS offers no advantage over GRS for this scenario; and indefinite retention violates retention policies.",
  }),

  dragDropQuestion({
    id: "Q2505",
    domain: "D5",
    type: "drag-drop",
    difficulty: "medium",
    company: "Contoso Retail Group",
    scenario:
      "Your organization is implementing Azure Site Recovery for a multi-tier web application with these recovery requirements:\n• Web Tier: 0-hour RTO, 1-hour RPO\n• Database: 4-hour RTO, 30-minute RPO\n• File Storage: 24-hour RTO, 8-hour RPO",
    stem: "Match each component to its appropriate Site Recovery replication strategy that meets requirements while minimizing operational overhead.",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Azure Site Recovery replication and recovery policies",

    hint: "Align replication frequency to RTO/RPO constraints: 0-hour RTO requires continuous replication, 4-hour RTO uses standard replication with defined intervals, and 24-hour RTO can use periodic snapshots.",
    availableItems: [
      "Continuous replication with frequent failover tests",
      "Standard replication with 4-hour recovery time objective",
      "Snapshots every 8 hours with manual recovery",
    ],
    answerSlots: [
      "Web Tier (0-hour RTO, 1-hour RPO)",
      "Database (4-hour RTO, 30-minute RPO)",
      "File Storage (24-hour RTO, 8-hour RPO)",
    ],
    correctOrder: [
      "Continuous replication with frequent failover tests",
      "Standard replication with 4-hour recovery time objective",
      "Snapshots every 8 hours with manual recovery",
    ],
    explanation:
      "Web tier with 0-hour RTO requires near-instantaneous failover via continuous replication and frequent failover tests to validate readiness. Database with 4-hour RTO uses standard replication with defined recovery intervals aligned to the 4-hour objective. File storage with 24-hour RTO can use snapshot-based recovery with 8-hour intervals, allowing reasonable recovery time while minimizing replication overhead. Recovery Point Objective (RPO) drives replication frequency; Recovery Time Objective (RTO) drives failover strategy.",
  }),

  choiceQuestion({
    id: "Q2506",
    domain: "D5",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Finance",
    scenario:
      "Your infrastructure team needs to apply security patches to 500 Azure virtual machines across multiple subscriptions. Updates must be deployed in a maintenance window on the second Tuesday of each month.",
    stem: "Which Azure service should you use to orchestrate this at scale?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Azure Update Manager maintenance windows",

    hint: "For patching at scale with recurring schedules and compliance visibility, use Azure Update Manager.",
    options: [
      option(
        "A",
        "Azure Update Manager with scheduled deployment",
        "Azure Update Manager supports scheduled deployments with maintenance windows, enabling organization-wide patch orchestration.",
      ),
      option(
        "B",
        "Automation Account runbooks",
        "Automation Account runbooks are procedural; they do not provide built-in patch scanning or update selection.",
      ),
      option(
        "C",
        "Manual SSH/RDP into each machine",
        "Manual patching does not scale to 500 machines and lacks compliance auditing.",
      ),
      option(
        "D",
        "Azure Marketplace extension templates",
        "Marketplace extensions are one-time deployments, not recurring maintenance windows.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Update Manager provides centralized patch management with scheduled deployments, maintenance windows, and pre/post deployment hooks. It supports bulk operations across subscriptions and provides compliance reporting. Runbooks require custom logic; manual patching is unscalable.",
  }),

  multiSelectQuestion({
    id: "Q2507",
    domain: "D5",
    type: "multi-select",
    difficulty: "hard",
    company: "Proseware Research",
    scenario:
      "Your research platform spans two Azure regions. The primary region (East US) has failed catastrophically. You must recover to the secondary region (West US) while maintaining referential integrity of replicated databases and ensuring users are routed to the secondary.",
    stem: "Which three actions must you take in the Site Recovery failover orchestration?",
    subtopic: "Monitor and maintain Azure resources",
    referenceTopic: "Azure Site Recovery recovery plans and failover",

    hint: "Fail over in dependency order, redirect client traffic to secondary endpoints, then commit after validation.",
    options: [
      option(
        "A",
        "Execute the recovery plan to fail over protected machines in dependency order",
        "Recovery plans define failover orchestration order based on multi-tier dependencies (e.g., database before app tier).",
      ),
      option(
        "B",
        "Update DNS entries or Application Gateway routing to the secondary region endpoint",
        "User traffic must be redirected to the secondary region after failover; this requires DNS or load balancer updates.",
      ),
      option(
        "C",
        "Commit the failover after validation",
        "Commit finalizes the failover and prevents back-replication to the failed primary region.",
      ),
      option(
        "D",
        "Disable the primary region subscription",
        "Disabling the subscription is an organizational decision, not a technical failover requirement.",
      ),
      option(
        "E",
        "Verify application connectivity and perform smoke tests",
        "Verification ensures the recovered environment is operational before full user traffic is switched.",
      ),
    ],
    selectCount: 3,
    correctOptionIds: ["A", "B", "C"],
    explanation:
      "Site Recovery failover orchestration consists of executing recovery plans (which fail over machines in order), updating traffic routing (DNS, load balancers) to the secondary region, and committing the failover. Disabling the primary subscription is a business decision not required for technical failover. Smoke tests are best practice but not mandatory for the failover orchestration itself.",
  }),

  // ============================================================================
  // D4: NETWORKING (Q2508–Q2512) - 5 questions
  // ============================================================================

  choiceQuestion({
    id: "Q2508",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Tailwind Traders",
    scenario:
      "Your hub-and-spoke network spans three spoke virtual networks (web, data, operations). You want all outbound internet traffic from spokes to be inspected by a network security appliance in the hub before leaving Azure.",
    stem: "Which routing component should you configure in the spoke subnets?",
    subtopic: "Implement and manage virtual networking",
    referenceTopic: "User-defined routes and network virtual appliances",

    hint: "To force internet-bound traffic through an NVA, set a default UDR (0.0.0.0/0) to the appliance next hop.",
    options: [
      option(
        "A",
        "User-defined route with 0.0.0.0/0 pointing to the NVA in the hub",
        "UDR with 0.0.0.0/0 (default route) pointing to the NVA IP ensures all internet-destined traffic is routed through the appliance.",
      ),
      option(
        "B",
        "Network Security Group rule to allow all outbound traffic",
        "NSGs filter traffic but do not redirect it through an appliance; UDRs control the routing path.",
      ),
      option(
        "C",
        "Service Endpoint for Internet",
        "Service Endpoints bypass the need for appliance inspection by creating a direct path; this contradicts the requirement.",
      ),
      option(
        "D",
        "Virtual network peering with traffic forwarding disabled",
        "Peering with forwarding disabled prevents traffic from the NVA from reaching destinations; this breaks inspection.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "User-defined routes (UDRs) control traffic forwarding at the subnet level. A route with destination 0.0.0.0/0 (default) pointing to the NVA IP redirects all non-RFC1918 traffic through the appliance. NSGs are insufficient alone; they do not redirect traffic. Service Endpoints bypass routing; peering without forwarding breaks the inspection path.",
  }),

  multiSelectQuestion({
    id: "Q2509",
    domain: "D4",
    type: "multi-select",
    difficulty: "medium",
    company: "Contoso Manufacturing",
    scenario:
      "Your virtual machine is unable to reach a remote service. Both a subnet-level NSG and a network interface-level NSG are applied. You want to troubleshoot which NSG rule is blocking the traffic.",
    stem: "Which two diagnostic approaches should you use in troubleshooting?",
    subtopic: "Implement and manage virtual networking",
    referenceTopic: "NSG Effective Security Rules and Network Watcher",

    hint: "Check Effective Security Rules for merged NSG behavior, then validate a specific flow with IP Flow Verify.",
    options: [
      option(
        "A",
        "Check Effective security rules on the NIC to see the combined evaluation",
        "Effective rules show the merged result of NIC and subnet NSGs, indicating which rule is blocking.",
      ),
      option(
        "B",
        "Use Network Watcher IP Flow Verify to test the specific traffic flow",
        "IP Flow Verify simulates packet flow and reports whether NSG rules allow or deny the traffic.",
      ),
      option(
        "C",
        "Remove the subnet NSG entirely",
        "Removing a production NSG is risky and not a diagnostic step; inspection should be non-destructive.",
      ),
      option(
        "D",
        "Check Application Gateway backend health probes",
        "Backend health probes are unrelated to NSG troubleshooting on a standalone VM.",
      ),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "Effective security rules display the combined result of all NSGs applied to a resource, showing which rules are evaluated. Network Watcher's IP Flow Verify tool simulates traffic and explicitly states whether the flow is allowed or denied, pinpointing the offending rule. Removing NSGs is not a diagnostic method.",
  }),

  choiceQuestion({
    id: "Q2510",
    domain: "D4",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum Corporation",
    scenario:
      "Your organization requires hybrid connectivity between an on-premises data center and Azure. Data must flow over a private link (not the public internet). Bandwidth requirements are stable at 200 Mbps.",
    stem: "Which hybrid connectivity solution best meets these requirements?",
    subtopic: "Implement and manage virtual networking",
    referenceTopic: "ExpressRoute vs. VPN Gateway for hybrid connectivity",

    hint: "If traffic must avoid the public internet entirely, prefer a dedicated private ExpressRoute circuit.",
    options: [
      option(
        "A",
        "Site-to-Site VPN over the public internet",
        "VPN encrypts traffic over the public internet but does not provide a private circuit; it is still internet-based.",
      ),
      option(
        "B",
        "ExpressRoute private peering with a dedicated circuit",
        "ExpressRoute provides a private circuit between on-premises and Azure, guaranteeing bandwidth and latency without traversing the public internet.",
      ),
      option(
        "C",
        "Azure Virtual WAN with IPsec tunnels",
        "Virtual WAN is designed for branch-to-cloud connectivity at scale but uses internet-based IPsec, not private circuits.",
      ),
      option(
        "D",
        "Private Link service with custom IP",
        "Private Link exposes Azure resources privately to on-premises clients; it does not provide hybrid connectivity from on-premises to Azure.",
      ),
    ],
    correctOptionId: "B",
    explanation:
      "ExpressRoute provides a dedicated private circuit between on-premises and Azure through a service provider. It guarantees bandwidth, low latency, and does not traverse the public internet. Site-to-Site VPN, while encrypted, still uses the public internet. Virtual WAN is branch-focused. Private Link is for accessing Azure resources privately, not hybrid WAN connectivity.",
  }),

  dragDropQuestion({
    id: "Q2511",
    domain: "D4",
    type: "drag-drop",
    difficulty: "medium",
    company: "Northwind Traders",
    scenario:
      "You are selecting an Azure load balancer SKU for three scenarios: (1) a high-availability internal API serving multiple applications, (2) a low-traffic legacy application, and (3) a public-facing e-commerce site with global traffic distribution.",
    stem: "Arrange each scenario with the appropriate load balancer SKU.",
    subtopic: "Implement and manage virtual networking",
    referenceTopic: "Azure Load Balancer SKUs (Basic, Standard, Gateway)",

    hint: "Use Standard Load Balancer for modern HA workloads; Basic is legacy and suitable only for low-demand scenarios.",
    availableItems: [
      "High-availability internal API → Standard Load Balancer",
      "Low-traffic legacy application → Basic Load Balancer",
      "Public-facing e-commerce → Standard Load Balancer",
    ],
    answerSlots: [
      "Scenario 1 Pairing",
      "Scenario 2 Pairing",
      "Scenario 3 Pairing",
    ],
    correctOrder: [
      "High-availability internal API → Standard Load Balancer",
      "Low-traffic legacy application → Basic Load Balancer",
      "Public-facing e-commerce → Standard Load Balancer",
    ],
    explanation:
      "Standard Load Balancer supports HA ports, availability zones, and robust health probes—required for internal APIs. Basic Load Balancer is suitable for low-traffic applications with basic requirements but is deprecated for new deployments. Standard is also needed for public e-commerce due to superior performance and global traffic handling. Gateway Load Balancer is for inline packet inspection, not these scenarios.",
  }),

  choiceQuestion({
    id: "Q2512",
    domain: "D4",
    type: "hot-area",
    difficulty: "hard",
    company: "Fabrikam Retail",
    scenario:
      "Your Application Gateway routes traffic to backend pools based on URL paths and hostnames. Path /api/* should route to an API pool, and hostname api.example.com should route to the same pool even if the path is different.",
    stem: "Which routing rule configuration takes precedence and how should rules be ordered?",
    subtopic: "Implement and manage virtual networking",
    referenceTopic: "Application Gateway path-based and host-based routing",

    hint: "Rule evaluation is ordered, so put the most specific matches ahead of broader catch-all patterns.",
    options: [
      option("A", "Host-based rules take precedence; order them before path-based rules", "Host-based rules evaluate first via the listener, but both types follow sequential ordering."),
      option("B", "Path-based rules take precedence; order them before host-based rules", "Path-based rules do not take precedence; both are ordered within the listener."),
      option("C", "Rules are evaluated sequentially by order; place more specific rules first", "Rules are indeed evaluated sequentially, with more specific patterns evaluated before general ones. This allows /api/v1/* to match before /api/*."),
      option("D", "Both are evaluated simultaneously; specificity is determined by listener priority", "Rules are sequential, not simultaneous. Listener priority selects the listener, not the rule matching order."),
    ],
    correctOptionId: "C",
    explanation:
      "Application Gateway rules are evaluated in order. Listener configuration (hostname + port) is evaluated first to select a listener, then path-based or other rules within that listener are evaluated sequentially. More specific rules (e.g., /api/v1/users) should precede general rules (e.g., /api/*). Host-based rules in the listener filter before path-based evaluation occurs.",
  }),

  // ============================================================================
  // D1: GOVERNANCE (Q2513–Q2517) - 5 questions
  // ============================================================================

  choiceQuestion({
    id: "Q2513",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "easy",
    company: "Woodgrove Bank",
    scenario:
      "Your organization must enforce a consistent governance policy across 30 Azure subscriptions. All resources must include an 'Owner' tag and be backed by Azure Backup. Audit trail is required.",
    stem: "Which Azure governance construct should you use for this organization-wide policy?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Policy initiatives vs. individual policies",

    hint: "For consistent controls across many subscriptions, assign a policy initiative at the management group scope.",
    options: [
      option(
        "A",
        "Individual Azure Policy assignments to each subscription",
        "Individual assignments work but are tedious and error-prone across 30 subscriptions.",
      ),
      option(
        "B",
        "Azure Policy initiative at the management group level",
        "A management group initiative assigns multiple policies in bulk to all child subscriptions, reducing management overhead and ensuring consistency.",
      ),
      option(
        "C",
        "Azure Resource Manager templates (ARM templates) for each resource",
        "ARM templates deploy resources but do not enforce ongoing governance on existing resources.",
      ),
      option(
        "D",
        "Azure Blueprints with manual assignment per subscription",
        "Blueprints are suitable for initial deployments; policy initiatives are better for ongoing governance.",
      ),
    ],
    correctOptionId: "B",
    explanation:
      "Azure Policy initiatives group multiple policies and can be assigned at the management group level, automatically applying to all child subscriptions. This is the scalable approach for organization-wide governance. Individual assignments scale poorly; ARM templates do not enforce ongoing compliance; Blueprints are for initial provisioning, not continuous governance.",
  }),

  choiceQuestion({
    id: "Q2514",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso Global",
    scenario:
      "Your Azure subscription hierarchy has three levels: Tenant Root, Business Unit management groups, and Subscriptions. You need to delegate resource creation permissions to business unit teams while preventing unauthorized subscription modifications.",
    stem: "At which scope should you assign the Contributor role to business unit teams?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "RBAC scopes and inheritance",

    hint: "Assign RBAC at the narrowest scalable parent scope so existing and future child subscriptions inherit automatically.",
    options: [
      option(
        "A",
        "At the Tenant Root scope",
        "Tenant Root scope grants permissions to all subscriptions and is overly broad.",
      ),
      option(
        "B",
        "At each individual subscription scope",
        "Individual subscription assignments work but do not scale with new subscriptions created later.",
      ),
      option(
        "C",
        "At the Business Unit management group scope",
        "Business Unit management group scope automatically applies to all child subscriptions, including future ones, while isolating permissions from other business units.",
      ),
      option(
        "D",
        "At the resource group scope only",
        "Resource group scope limits permissions to existing resource groups and does not allow new ones to be created.",
      ),
    ],
    correctOptionId: "C",
    explanation:
      "RBAC roles assigned at the management group scope are inherited by all child subscriptions. This is the scalable approach for delegating team access while maintaining isolation. Assignment at a business unit management group ensures new subscriptions under that group automatically inherit the role, whereas individual subscription assignments require manual replication.",
  }),

  multiSelectQuestion({
    id: "Q2515",
    domain: "D1",
    type: "multi-select",
    difficulty: "medium",
    company: "Adatum Finance",
    scenario:
      "You must restrict Azure resource creation to only resources with a 'CostCenter' tag and only users who belong to a specific Microsoft Entra group called 'Azure-Operators'.",
    stem: "Which two RBAC features should you combine to enforce this?",
    subtopic: "Manage access to Azure resources",
    referenceTopic: "RBAC with conditions",

    hint: "RBAC conditions can constrain both who acts (principal attributes) and what resources they can act on (resource attributes).",
    options: [
      option(
        "A",
        "Condition-based access on the Contributor role using principal attribute matching",
        "Principal attribute matching restricts role assignment to members of a specific Microsoft Entra group.",
      ),
      option(
        "B",
        "Condition-based access on the Contributor role using resource attribute matching",
        "Resource attribute matching restricts actions to resources that have the CostCenter tag.",
      ),
      option(
        "C",
        "Azure Policy with DeployIfNotExists effect",
        "DeployIfNotExists enforces tagging policy but does not control who can deploy; it is orthogonal to RBAC conditions.",
      ),
      option(
        "D",
        "NSG rules to block untagged resources",
        "NSGs are for network filtering, not resource creation control.",
      ),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "RBAC conditions support both principal attributes (who) and resource attributes (what). Principal attribute matching restricts permissions to users in specific Microsoft Entra groups. Resource attribute matching restricts permissions to resources with specific tags. Together, they enforce both 'who' and 'what' constraints. Policy effects and NSGs are not RBAC mechanisms.",
  }),

  choiceQuestion({
    id: "Q2516",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Proseware Compliance",
    scenario:
      "An Azure Policy rule requires all storage accounts to use HTTPS only. However, a legacy application requires HTTP access for 30 days while being refactored. You do not want to modify the policy definition.",
    stem: "Which action minimizes privilege while meeting the temporary exception?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Policy exemptions vs. modifications",

    hint: "Use a time-bound policy exemption for temporary exceptions instead of weakening the policy definition.",
    options: [
      option(
        "A",
        "Create a policy exemption for the legacy storage account for 30 days",
        "Exemptions allow temporary non-compliance without modifying the policy, and they automatically expire after the specified duration.",
      ),
      option(
        "B",
        "Modify the policy definition to exclude HTTP-based scenarios",
        "Modifying the policy weakens it permanently for all resources, not just the legacy account.",
      ),
      option(
        "C",
        "Assign the Owner role to the application team to disable policy on the resource",
        "Owner role allows bypassing policies but grants excessive permissions; this violates least privilege.",
      ),
      option(
        "D",
        "Create a separate, less-strict policy for legacy workloads",
        "Creating parallel policies causes confusion and weaker overall governance.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Policy exemptions provide temporary, time-bound exceptions without weakening the policy definition. The exemption automatically expires after 30 days. This approach maintains policy integrity for all other resources while accommodating the temporary exception. Modifying the policy, granting Owner role, or creating alternate policies all weaken governance.",
  }),

  choiceQuestion({
    id: "Q2517",
    domain: "D1",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Alpine Retail",
    scenario:
      "Your cloud operations team must reduce Azure spending by 20% over the next quarter. You want to provide visibility into cost drivers and automatically enforce spending limits by subscription without blocking deployments.",
    stem: "Which two Azure services should you combine for cost governance?",
    subtopic: "Manage Azure subscriptions and governance",
    referenceTopic: "Azure Cost Management and Budgets",

    hint: "Pair cost analytics for visibility with budgets and action-group alerts for proactive cost governance.",
    options: [
      option(
        "A",
        "Cost Management analytics with Budgets and action group alerts",
        "Cost Management provides spend visibility and forecasting. Budgets set spending thresholds and trigger alerts via action groups when limits are approached.",
      ),
      option(
        "B",
        "Azure Policy with deny-on-expensive-resources",
        "No built-in policy exists to deny based on cost; policies control resource types, not spending.",
      ),
      option(
        "C",
        "Azure Advisor recommendations for cost optimization",
        "Advisor provides recommendations but does not enforce spending limits or automate governance.",
      ),
      option(
        "D",
        "Billing alerts via Azure Monitor",
        "Monitor alerts notify of spending but do not enforce limits or provide detailed cost attribution.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Cost Management provides detailed cost analysis and anomaly detection. Budgets set threshold-based alerts and can trigger automation via action groups. Together, they enable spend visibility, forecasting, and alert-driven governance without blocking deployments. Policy-based cost denial is not a native Azure feature. Advisor is advisory only. Monitor alerts lack cost-specific context.",
  }),

  // ============================================================================
  // D3: COMPUTE (Q2518–Q2521) - 4 questions
  // ============================================================================

  choiceQuestion({
    id: "Q2518",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso Web Services",
    scenario:
      "Your Virtual Machine Scale Set runs a stateless web service. You want to deploy updates with zero downtime while maintaining application availability during the rolling update process.",
    stem: "Which VMSS upgrade policy and health probe configuration should you use?",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "VMSS rolling upgrade policies and health probes",

    hint: "Rolling upgrades plus health checks let instances update in batches while preserving service availability.",
    options: [
      option(
        "A",
        "Rolling upgrade with platform-managed health checks",
        "Rolling upgrades update instances in batches. Platform-managed health checks monitor instance health during the upgrade, pausing if instances become unhealthy.",
      ),
      option(
        "B",
        "Automatic upgrade with custom health probe disabled",
        "Automatic upgrade with health checks disabled risks deploying broken builds to production.",
      ),
      option(
        "C",
        "Manual upgrade policy",
        "Manual upgrades require administrator intervention for each batch and do not enable zero-downtime deployments.",
      ),
      option(
        "D",
        "Blue-Green deployment with two separate scale sets",
        "Blue-Green is valid but more complex than rolling upgrades; rolling upgrades are simpler for zero-downtime updates.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Rolling upgrades update instances sequentially or in batches. Platform-managed health checks ensure instances pass health probes before the upgrade proceeds to the next batch, minimizing downtime. This is the standard approach for stateless workloads. Manual upgrades are tedious; blue-green requires double the infrastructure.",
  }),

  choiceQuestion({
    id: "Q2519",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Fabrikam Cloud Apps",
    scenario:
      "You are running a containerized microservice on Azure Container Apps. The service requires database connection strings and API keys. These secrets must not be visible in container image layers or environment variables.",
    stem: "Which Container Apps feature should you use to manage secrets?",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "Azure Container Apps secrets and environment variables",

    hint: "Store sensitive values in Container Apps secrets and reference them securely instead of embedding in images or plain env vars.",
    options: [
      option(
        "A",
        "Secrets defined in the Container Apps configuration",
        "Container Apps secrets are stored securely and referenced by name in container definitions without exposing values in logs or environment variables.",
      ),
      option(
        "B",
        "Environment variables in the Dockerfile",
        "Dockerfile environment variables are baked into the image, exposing secrets to anyone with image access.",
      ),
      option(
        "C",
        "Configuration revisions with embedded secrets",
        "Configuration revisions manage deployments but do not secure secrets; they are just versioning.",
      ),
      option(
        "D",
        "Azure Key Vault with managed identity",
        "Key Vault is excellent but requires integration code; Container Apps secrets are simpler for direct secret management.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Container Apps secrets are stored securely and referenced by name in containers. They are never displayed in logs or UI, and they are not baked into images. This is simpler than Key Vault integration for simple use cases. Dockerfile variables expose secrets; configuration revisions are for versioning, not security.",
  }),

  choiceQuestion({
    id: "Q2520",
    domain: "D3",
    type: "multiple-choice",
    difficulty: "hard",
    company: "Adatum Hybrid",
    scenario:
      "Your organization runs 50 Windows servers across multiple on-premises data centers and Azure. You need to apply Windows Updates, Microsoft Defender policies, and guest configuration compliance audits uniformly across all servers.",
    stem: "Which Azure service enables this hybrid management at scale?",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "Azure Arc for hybrid server management",

    hint: "Azure Arc extends Azure management to on-prem servers so Update Manager and policy controls apply consistently.",
    options: [
      option(
        "A",
        "Azure Arc-enabled servers with Azure Update Manager and guest configuration",
        "Azure Arc onboards on-premises servers to Azure management plane. Update Manager and guest configuration policies apply to Arc-enabled servers uniformly.",
      ),
      option(
        "B",
        "Azure Automation Desired State Configuration (DSC)",
        "DSC provides configuration management but requires custom scripts for each server.",
      ),
      option(
        "C",
        "System Center Configuration Manager (SCCM) integration",
        "SCCM is on-premises; it does not natively integrate Azure update policies.",
      ),
      option(
        "D",
        "Individual Group Policy Objects on each server",
        "GPO does not scale across on-premises and Azure or provide compliance auditing to the cloud.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Azure Arc registers on-premises servers to the Azure management plane. Once registered, Update Manager applies patches uniformly, and guest configuration policies audit compliance. This is the modern unified approach. DSC requires custom scripts; SCCM is legacy and on-premises only; GPOs do not provide cloud integration or scaling.",
  }),

  multiSelectQuestion({
    id: "Q2521",
    domain: "D3",
    type: "multi-select",
    difficulty: "medium",
    company: "Tailwind Airlines",
    scenario:
      "An Azure virtual machine is unresponsive over RDP. The OS may have hung or crashed. You want to diagnose the issue without physically accessing the machine.",
    stem: "Which three diagnostic tools can help troubleshoot the VM status?",
    subtopic: "Deploy and manage Azure compute resources",
    referenceTopic: "VM diagnostics (boot diagnostics, Run Command, serial console)",

    hint: "Use Boot diagnostics, Serial console, and Run Command together when RDP is unavailable or the OS appears hung.",
    options: [
      option(
        "A",
        "Boot diagnostics to view OS startup logs and error screens",
        "Boot diagnostics captures console output and screenshots during startup, revealing OS-level failures.",
      ),
      option(
        "B",
        "Serial console to connect to the VM's serial port directly",
        "Serial console provides low-level access even if the OS is hung, allowing direct OS interaction.",
      ),
      option(
        "C",
        "Azure Bastion for remote desktop access",
        "Bastion provides RDP/SSH access but will fail if the OS is hung; it is not a diagnostic tool.",
      ),
      option(
        "D",
        "Run Command to execute commands remotely",
        "Run Command bypasses RDP by executing PowerShell/bash commands at the OS level, useful for diagnostics and remediation.",
      ),
      option(
        "E",
        "Application Insights performance monitoring",
        "Application Insights monitors application telemetry, not OS-level diagnostics.",
      ),
    ],
    selectCount: 3,
    correctOptionIds: ["A", "B", "D"],
    explanation:
      "Boot diagnostics show OS startup status and errors. Serial console provides direct OS access for low-level interaction even when hung. Run Command executes commands without RDP. Together, they enable comprehensive troubleshooting. Bastion is for access, not diagnosis; Application Insights is for application monitoring, not OS diagnostics.",
  }),

  // ============================================================================
  // D2: STORAGE (Q2522–Q2524) - 3 questions
  // ============================================================================

  choiceQuestion({
    id: "Q2522",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Northwind Logistics",
    scenario:
      "You need to migrate 500 TB of archival data from an on-premises NAS to Azure Blob Storage. The network bandwidth is limited to 10 Mbps. You have 30 days to complete the migration.",
    stem: "Which data migration method is most appropriate?",
    subtopic: "Implement and manage storage",
    referenceTopic: "Azure data migration strategies (Data Box, AzCopy, Storage Migration Service)",

    hint: "For very large data with low bandwidth and tight timelines, choose offline migration with Azure Data Box.",
    options: [
      option(
        "A",
        "AzCopy with multi-threaded parallel transfers over the public internet",
        "AzCopy over 10 Mbps for 500 TB would take months, not 30 days.",
      ),
      option(
        "B",
        "Azure Data Box (physical appliance) for offline transfer",
        "Data Box is designed for large offline migrations. You receive a device locally, load data, ship to Microsoft, and data is uploaded to Azure.",
      ),
      option(
        "C",
        "Azure Storage Migration Service",
        "Storage Migration Service is for on-premises file share migrations to Azure Files, not Blob Storage archival.",
      ),
      option(
        "D",
        "ExpressRoute with direct AzCopy transfer",
        "ExpressRoute improves bandwidth but 10 Mbps is the network constraint; upgrades may not be timely for 30 days.",
      ),
    ],
    correctOptionId: "B",
    explanation:
      "Azure Data Box is designed for large-scale offline migrations when network bandwidth is limited. You ship data to Microsoft who uploads it to Azure, bypassing network constraints. 500 TB over 10 Mbps would take ~463 days online; Data Box completes in weeks. AzCopy is better for smaller datasets. Storage Migration Service targets file shares.",
  }),

  choiceQuestion({
    id: "Q2523",
    domain: "D2",
    type: "multiple-choice",
    difficulty: "medium",
    company: "Contoso Research",
    scenario:
      "Your research team needs high-throughput file share access for model training workloads running on compute instances in Azure. Standard file shares are causing I/O bottlenecks.",
    stem: "Which specialized storage configuration should you use?",
    subtopic: "Implement and manage storage",
    referenceTopic: "Premium file shares and NFS 3.0 storage",

    hint: "When standard Azure Files cannot meet throughput/IOPS targets, move to Premium file shares for high-performance workloads.",
    options: [
      option(
        "A",
        "Premium file shares with SMB 3.x protocol",
        "Premium file shares offer higher throughput and IOPS than standard shares, suitable for high-performance workloads.",
      ),
      option(
        "B",
        "Standard file shares with Azure CDN caching",
        "CDN caches content but does not increase underlying share throughput.",
      ),
      option(
        "C",
        "Blob Storage with HDInsight cluster",
        "HDInsight is for big data processing, not general-purpose file share performance.",
      ),
      option(
        "D",
        "Data Lake Storage Gen2 with hierarchical namespace",
        "Data Lake is optimized for analytics, not as a primary file share for model training.",
      ),
    ],
    correctOptionId: "A",
    explanation:
      "Premium file shares provide up to 100k IOPS and 100 Gbps throughput, compared to standard shares' lower limits. They are ideal for performance-sensitive workloads like model training. CDN is for content caching. HDInsight is for distributed analytics. Data Lake is for analytics, not real-time training workloads.",
  }),

  multiSelectQuestion({
    id: "Q2524",
    domain: "D2",
    type: "multi-select",
    difficulty: "hard",
    company: "Alpine Finance Compliance",
    scenario:
      "You store compliance audit logs in Azure Blob Storage. Regulations require that logs be immutable for 7 years and automatically deleted after 10 years. Logs must not be recoverable even if accidentally deleted.",
    stem: "Which two storage protection policies should you configure?",
    subtopic: "Implement and manage storage",
    referenceTopic: "Immutability policies and lifecycle management",

    hint: "Combine a time-based immutability policy for the mandatory retention period with lifecycle deletion for end-of-life cleanup.",
    options: [
      option(
        "A",
        "Immutable storage policy with a 7-year retention period and Delete Lock",
        "Immutable policy prevents modification or deletion for the retention period. Delete Lock prevents policy modification, enforcing compliance.",
      ),
      option(
        "B",
        "Lifecycle management rule to delete blobs after 10 years",
        "Lifecycle rules automatically transition or delete blobs based on age, ensuring deletion after 10 years.",
      ),
      option(
        "C",
        "Legal Hold instead of immutability policy",
        "Legal Hold is indefinite; it does not auto-delete after 10 years and violates the 10-year maximum retention requirement.",
      ),
      option(
        "D",
        "Soft Delete with a 10-year retention window",
        "Soft Delete preserves deleted blobs for recovery but is not immutable; it can be disabled and violates the non-recovery requirement.",
      ),
    ],
    selectCount: 2,
    correctOptionIds: ["A", "B"],
    explanation:
      "The solution requires two complementary policies: (1) Immutability policy with 7-year retention and Delete Lock makes blobs non-modifiable and non-deletable during the retention period, preventing accidental deletion and enforcing regulatory compliance. (2) Lifecycle management automatically deletes blobs after 10 years, meeting the automatic deletion requirement. Legal Hold is indefinite and does not support automatic deletion; Soft Delete is reversible and does not prevent recovery, violating compliance requirements.",
  }),
];

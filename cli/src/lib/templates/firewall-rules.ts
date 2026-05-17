/**
 * @deprecated Import from shared template instead:
 * import { OBSERVABILITY_FIREWALL_RULES, OBSERVABILITY_PORTS } from 'src/modules/infrastructure/firewalls/templates/firewall-rules.template';
 *
 * This file is kept for backward compatibility with existing CLI code.
 * New code should use the shared template.
 */
export {
  OBSERVABILITY_FIREWALL_RULES,
  OBSERVABILITY_PORTS,
  WORKLOAD_FIREWALL_RULES,
  WORKLOAD_PORTS,
  validateFirewallRules,
  getFirewallRulesForClusterType,
} from '../../../../src/modules/infrastructure/firewalls/templates/firewall-rules.template';

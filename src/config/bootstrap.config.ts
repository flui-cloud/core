/**
 * Bootstrap Scripts Configuration
 *
 * Configuration for downloading initialization scripts from GitHub.
 * Scripts are hosted in the flui-cloud/flui-bootstrap repository.
 */

export interface BootstrapConfig {
  /**
   * Base URL for downloading scripts
   * Can be overridden via environment variable BOOTSTRAP_SCRIPTS_URL
   */
  scriptsBaseUrl: string;

  /**
   * Available scripts
   */
  scripts: {
    fluiInit: string;
    k3sMaster: string;
    k3sWorker: string;
  };

  /**
   * GitHub repository information
   */
  repository: {
    org: string;
    name: string;
    branch: string;
  };
}

/**
 * Default bootstrap configuration
 */
export const BOOTSTRAP_CONFIG: BootstrapConfig = {
  scriptsBaseUrl:
    process.env.BOOTSTRAP_SCRIPTS_URL ||
    'https://raw.githubusercontent.com/flui-cloud/bootstrap-scripts/master/scripts',

  scripts: {
    fluiInit: 'flui-init.sh',
    k3sMaster: 'k3s-master-init.sh',
    k3sWorker: 'k3s-worker-init.sh',
  },

  repository: {
    org: 'flui-cloud',
    name: 'bootstrap-scripts',
    branch: 'master',
  },
};

/**
 * Get the full URL for a script
 */
export function getScriptUrl(
  scriptName: keyof BootstrapConfig['scripts'],
): string {
  return `${BOOTSTRAP_CONFIG.scriptsBaseUrl}/${BOOTSTRAP_CONFIG.scripts[scriptName]}`;
}

import fs from 'node:fs';
import path from 'node:path';

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function fileExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function findWorkspaceRoot(startDir = process.cwd()) {
  let dir = path.resolve(startDir);

  while (true) {
    const angularJson = path.join(dir, 'angular.json');
    if (fileExists(angularJson)) return dir;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  die(`Unable to locate angular.json by walking up from: ${startDir}`);
}

export function readAngularJson(workspaceRoot) {
  const p = path.join(workspaceRoot, 'angular.json');
  if (!fileExists(p)) die(`Missing angular.json at: ${p}`);
  const raw = fs.readFileSync(p, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    die(`Invalid JSON in angular.json: ${e?.message ?? e}`);
  }
}

function isApplicationProject(project) {
  return project?.projectType === 'application';
}

export function getDefaultAppProjectName(angularJson) {
  const projects = angularJson?.projects ?? {};
  const defaultProject = angularJson?.defaultProject;

  if (
    defaultProject &&
    projects[defaultProject] &&
    isApplicationProject(projects[defaultProject])
  ) {
    return defaultProject;
  }

  for (const [name, proj] of Object.entries(projects)) {
    if (isApplicationProject(proj)) return name;
  }

  die(`No application project found in angular.json`);
}

export function getProject(angularJson, projectName) {
  const projects = angularJson?.projects ?? {};
  const p = projects[projectName];
  if (!p) die(`Project "${projectName}" not found in angular.json`);
  return p;
}

export function getWorkspaceContext(opts = {}) {
  const workspaceRoot = findWorkspaceRoot(opts.startDir ?? process.cwd());
  const angularJson = readAngularJson(workspaceRoot);

  const appProjectName = opts.appProjectName ?? getDefaultAppProjectName(angularJson);
  const appProject = getProject(angularJson, appProjectName);

  const sourceRootRel = appProject.sourceRoot ?? 'src';
  const sourceRoot = path.join(workspaceRoot, sourceRootRel);
  const appRoot = path.join(sourceRoot, 'app');
  const featuresDir = path.join(appRoot, 'features');
  const appRoutesFile = path.join(appRoot, 'app.routes.ts');

  return {
    workspaceRoot,
    angularJson,
    appProjectName,
    appProject,
    sourceRoot,
    appRoot,
    featuresDir,
    appRoutesFile,
  };
}

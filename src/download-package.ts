import {exec, ExecOutputReturnValue, mkdir, rm, test} from "shelljs";

export function downloadPackage(host: string, domain: string, pkgName: string, dest: string): boolean {
  let repo = host + '/' + domain + '/' + pkgName;
  let gitCloneCmd = ['git clone --depth 1', repo, dest].join(' ');

  if (!test('-d', dest)) {
    mkdir('-p', dest);
  }

  let gitClone: ExecOutputReturnValue = <ExecOutputReturnValue>exec(gitCloneCmd, {silent: true});

  if (gitClone.code !== 0) {
    rm('-r', dest);
    return false;
  }

  return true;
}

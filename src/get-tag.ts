import {clean, compare, satisfies} from "semver";
import {exec, ExecOutputReturnValue} from "shelljs";
import {ChildProcess} from "child_process";

const RE = {
  LINES: /\n/g,
  TAG_PREFIX: /^.*refs\/tags\//g
};

/**
 * Get all available tags of the given repository
 */
export function tagList(host: string, domain: string, pkgName: string): string[] {
  let remoteCmd: string = 'git ls-remote -t ' + host + '/' + domain + '/' + pkgName + '.git';
  let remote: ExecOutputReturnValue | ChildProcess = exec(remoteCmd, {silent: true});

  let output: string[] = remote.stdout.toString().split(RE.LINES).slice(0, -1);

  return output.map(removeTagPrefix);
}

/**
 * Get the latest version tag which falls in the version range
 */
export function getTag(host: string, domain: string, pkgName: string, versionRange: string): string {
  let tags: string[] = tagList(host, domain, pkgName);

  let tagsInRange: string[] = tags.filter(
    (tag: string): boolean => {
      return satisfies(clean(tag), versionRange);
    });

  return <string>tagsInRange.sort(compareTags).pop();
}

function compareTags(a: string, b: string): number {
  return compare(clean(a), clean(b));
}

function removeTagPrefix(line: string): string {
  return line.replace(RE.TAG_PREFIX, '');
}

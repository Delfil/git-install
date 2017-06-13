'use strict';

import {clean, compare, satisfies} from "semver";
import {exec, ExecOutputReturnValue} from "shelljs";
import {ChildProcess} from "child_process";

let cache: any = {};

const RE = {
  LINES: /\n/g,
  TAG_PREFIX: /^.*refs\/tags\//g
};

/**
 * Get all available tags of the given repository
 */
export function tagList(host: string, domain: string, pkgName: string): string[] {
  let remote: string = host + '/' + domain + '/' + pkgName + '.git';
  if (cache[remote]) {
    return cache[remote];
  }

  let cmd: ExecOutputReturnValue | ChildProcess = exec('git ls-remote -t ' + remote, {silent: true});
  let output: string[] = cmd.stdout.toString().split(RE.LINES).slice(0, -1);

  let tags: string[] = output.map(function (line) {
    return line.replace(RE.TAG_PREFIX, '');
  });

  cache[remote] = tags;
  return tags;
}

/**
 * Get the latest version tag which falls in the version range
 */
export function getTag(host: string, domain: string, pkgName: string, versionRange: string): string {
  let tags: string[] = tagList(host, domain, pkgName);

  let tagsInRange: string[] = tags.filter(function (tag) {
    return satisfies(clean(tag), versionRange);
  });

  let compareTags = function (a: string, b: string) {
    return compare(clean(a), clean(b));
  };

  return <string>tagsInRange.sort(compareTags).pop();
}

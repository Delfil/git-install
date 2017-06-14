import {cd, exec, ExecOutputReturnValue} from "shelljs";

/**
 * Perform a fetch on the current local repository to fetch all tags.
 * @returns {boolean} whether the fetch was successful
 */
function fetchTags(): boolean {
  let gitFetchCmd: string = 'git fetch --tags --prune';
  return (<ExecOutputReturnValue>exec(gitFetchCmd, {silent: true})).code === 0;
}

/**
 * Performs a checkout to the required tag
 * @returns {boolean} whether the checkout was successful
 */
function checkoutTag(tag): boolean {
  let gitCheckoutCmd: string = 'git checkout  -f tags/' + tag;
  let gitCheckout: ExecOutputReturnValue = <ExecOutputReturnValue>exec(gitCheckoutCmd, {silent: true});

  return (gitCheckout.code === 0);
}

/**
 * Get the current checkout version of the local repository
 * @returns {string} a string containing the tag of the current tag checkout
 */
function getCurrentTag(): string {
  let gitCurrentTagCmd: string = 'git describe --all';
  let gitCurrentTag: ExecOutputReturnValue = <ExecOutputReturnValue>exec(gitCurrentTagCmd, {silent: true});
  return gitCurrentTag.stdout;
}

/**
 * Performs a checkout to the required tag if the package is not up to date.
 * @returns {boolean} whether nothing went wrong
 */
export function checkoutVersion(tag: string, dest: string, pkgLog: string) {
  cd(dest);
  // Skip is already up to date
  if (getCurrentTag().indexOf(tag) !== -1) {
    return true;
  }
  // Obtain the latest tags
  fetchTags();

  // Checkout to tag
  console.info('Updating ' + pkgLog + '...');
  return checkoutTag(tag);
}
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) https://awesomeyou.io and contributors. All rights reserved.
 *  Licensed under the GNU Affero General Public License v3.0. See https://github.com/wellwelwel/awesomeyou/blob/main/LICENSE for license information.
 *--------------------------------------------------------------------------------------------*/

export const normalizeChars = (text: string): string =>
  text
    .normalize('NFD')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9-]/g, '');

import { program } from 'commander';
import chokidar from 'chokidar';
import { resolve } from 'path';

import { mdxToJson } from '../dist';
import { readSync, writeFileSync } from 'fs';

const cwd = process.cwd();

const cache = new Map();

/**
 *
 * @param {string} filePath
 * @param {string} rootDir
 */
function getSlug(filePath, rootDir) {
    const slug = filePath
        .replace(rootDir, '')
        .replace('.mdx', '')
        .replace(/\./g, '_');

    return slug;
}

/**
 *
 * @param {string} filePath
 * @param {string} rootDir
 */
function updateFile(filePath, rootDir) {
    const mdxString = readSync(resolve(cwd, rootDir, filePath), 'utf-8');

    const json = mdxToJson(mdxString);

    const slug = getSlug(filePath, rootDir);

    cache.set(slug, {
        slug,
        data: json,
        relativePath: resolve(rootDir, filePath),
        absolutePath: resolve(cwd, rootDir, filePath),
    });
}

function writeFile(dest) {
    writeFileSync(
        resolve(cwd, dest, 'posts.json'),
        JSON.stringify(cache.values()),
    );
}

program
    .command('watch')
    .description('watch a folder and compile all mdx files to a json store')
    .argument('<string>', 'source folder')
    .option('-d --dest', 'output folder')
    .action((source, options) => {
        const watcher = chokidar.watch(resolve(cwd, source));

        watcher.on('add', (path, stats) => {
            if (stats.isFile()) {
                updateFile(path, source);
                writeFile(options.dest);
            }
        });

        watcher.on('change', (path, stats) => {
            if (stats.isFile()) {
                updateFile(path, source);
                writeFile(options.dest);
            }
        });
    });

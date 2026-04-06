import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = glob.sync('src/**/*.{js,jsx}');

files.forEach(file => {
  let content = readFileSync(file, 'utf8');
  let modified = false;

  // Remove TypeScript type annotations from function parameters
  const typeAnnotationPattern = /\(\s*\{([^}]+)\}\s*:\s*React\.(HTMLAttributes|ComponentProps)<[^>]+>\s*\)/g;
  if (typeAnnotationPattern.test(content)) {
    content = content.replace(typeAnnotationPattern, '({ $1 })');
    modified = true;
  }

  // Remove Pick<ButtonProps, "size"> type patterns
  const pickPattern = /type\s+\w+\s*=\s*\{[^}]+\}\s*&\s*Pick<[^>]+>\s*&[^;]+;/g;
  if (pickPattern.test(content)) {
    content = content.replace(pickPattern, '');
    modified = true;
  }

  // Fix Drawer import
  if (content.includes('import { Drawer"vaul";')) {
    content = content.replace('import { Drawer"vaul";', 'import { Drawer as DrawerPrimitive } from "vaul";');
    modified = true;
  }

  if (modified) {
    writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Type annotation cleanup complete!');

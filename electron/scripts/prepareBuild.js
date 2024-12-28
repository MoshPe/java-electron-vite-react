const { spawnSync } = require('child_process');
const { copySync, mkdirSync, rmSync } = require('fs-extra');
const { join } = require('path');

// Define paths
const viteAppPath = join(__dirname, '..', '..', 'frontend'); // Path to your Vite app
const viteDistPath = join(__dirname, '..', '..', 'frontend', 'dist'); // Vite build output
const mavenTargetPath = join(__dirname, '..', '..', 'backend', 'target', 'backend-jar-with-dependencies.jar'); // Maven JAR file path
const buildDir = join(__dirname, '..', 'build'); // Consolidated build directory

// Clean and prepare the build directory
console.log('Cleaning the build directory...');
rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });

// Step 1: Build Maven project
console.log('Building Maven project...');
const mavenBuild = spawnSync('D:\\"Software Utils"\\Aqua\\plugins\\maven\\lib\\maven3\\bin\\mvn', ['clean', 'package', '-DskipTests'], {
    cwd: join(__dirname, '..', '..', 'backend'), // Set the working directory to your backend project
    stdio: 'inherit', // Display Maven output in the console
    shell: true,
});

if (mavenBuild.error) {
    console.error('Maven build failed:', mavenBuild.error);
    process.exit(1);
}

// Build Vite application
console.log('Building Vite application...');
const viteBuild = spawnSync('npm', ['run', 'build'], {
    cwd: viteAppPath,
    stdio: 'inherit', // Display Vite output in the console
    shell: true, // Use shell to ensure cross-platform compatibility
});

if (viteBuild.error) {
    console.error('Failed to build Vite application:', viteBuild.error);
    process.exit(1);
}

// Copy Vite output
console.log('Copying Vite build...');
copySync(viteDistPath, join(buildDir, 'frontend'), { recursive: true }); // Copy Vite build to build/frontend

// Copy Maven output
console.log('Copying Maven package...');
mkdirSync(join(buildDir, 'backend'), { recursive: true }); // Ensure backend directory exists
copySync(mavenTargetPath, join(buildDir, 'backend', 'backend-jar-with-dependencies.jar')); // Copy JAR file to build/backend

console.log('Build preparation complete.');

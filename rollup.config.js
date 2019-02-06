import resolve from 'rollup-plugin-node-resolve';
// import { terser } from "rollup-plugin-terser";

export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/flatten.cjs.js',
            format: 'cjs',
            exports: 'named'
        },
        {
            file: 'dist/flatten.esm.js',
            format: 'esm',
            exports: 'named'
        },
        {
            file: 'dist/flatten.umd.js',
            format: 'umd',
            name: 'flatten',
            exports: 'named'
        },
    ],
    plugins: [
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        })
    ]
};

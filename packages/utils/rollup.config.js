import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/main.esm.js',
            format: 'esm',
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

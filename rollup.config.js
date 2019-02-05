export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/flatten.cjs.js',
            format: 'cjs'
        },
        {
            file: 'dist/flatten.esm.js',
            format: 'esm'
        },
        {
            file: 'dist/flatten.umd.js',
            format: 'umd',
            name: 'flatten'
        }
    ]
};

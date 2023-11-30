/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true
    },
    webpack: (config) => {
        config.externals.push({
            "utf-8-validate": "commonjs utf-8-validate",
            "bufferutil": "commonjs bufferutil",
        });

        return config;
    },
};

module.exports = nextConfig
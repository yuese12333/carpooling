module.exports = function (api) {
    api.cache(true);
    const isTest = process.env.NODE_ENV === 'test';

    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: isTest ? "react" : "nativewind" }],
            // 测试环境不加载 nativewind/babel，避免注入运行时代码
            ...(isTest ? [] : ["nativewind/babel"]),
        ],
        plugins: [
            'react-native-worklets/plugin',
        ],
    };
};
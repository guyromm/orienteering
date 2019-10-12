//const rewireMobX = require("react-app-rewire-mobx");
const {addDecoratorsLegacy, useEslintRc, override} = require('customize-cra');

module.exports = override(
    addDecoratorsLegacy(),
    useEslintRc('./.eslintrc')
);

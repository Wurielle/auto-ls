'use strict';
var _ = require('lodash');

module.exports = {
    "env": {
        "node": true,
		"mocha": true
    },
    "globals": {
        "Promise": true,
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "arrowFunctions": false,
            "binaryLiterals": false,
            "blockBindings": false,
            "experimentalObjectRestSpread": false,
        }
    },
    "rules": {
        "accessor-pairs": "error",
        "array-bracket-spacing": [
            "error",
            "never"
        ],
        "array-callback-return": "error",
        "arrow-body-style": "warn",
        "arrow-parens": [
            "off",
            "as-needed",
            {
                "requireForBlockBody": true
            }
        ],
        "arrow-spacing": [
            "error",
            {
                "after": true,
                "before": true
            }
        ],
        "block-scoped-var": "error",
        "block-spacing": "error",
        "brace-style": [
            "error",
            "stroustrup"
        ],
        "callback-return": "warn",
        "camelcase": "warn",
        "class-methods-use-this": "warn",
        "comma-dangle": [
            "error",
            "only-multiline"
        ],
        "comma-spacing": [
            "error",
            {
                "after": true,
                "before": false
            }
        ],
        "comma-style": [
            "error",
            "last"
        ],
        "complexity": "error",
        "computed-property-spacing": "error",
        "consistent-return": "error",
        "consistent-this": ["warn", "self"],
        "curly": "error",
        "default-case": "error",
        "dot-location": [
            "error",
            "property"
        ],
        "dot-notation": [
            "error",
            {
                "allowKeywords": true
            }
        ],
        "eol-last": "error",
        "eqeqeq": "warn",
        "func-call-spacing": "error",
        "func-names": "error",
        "func-style": [
            "warn",
            "expression"
        ],
		"no-cond-assign": "off",
        "generator-star-spacing": "error",
        "global-require": "off",
        "guard-for-in": "warn",
        "handle-callback-err": "error",
        "id-blacklist": "error",
        "id-length": "off",
        "id-match": "error",
        "indent": [
            "warn",
            4
        ],
        "init-declarations": "off",
        "jsx-quotes": "error",
        "key-spacing": "error",
        "keyword-spacing": "off",
        "line-comment-position": "warn",
        "max-depth": "error",
        "max-len": "off",
        "max-lines": "warn",
        "max-nested-callbacks": "error",
        "max-params": "off",
        "max-statements-per-line": "error",
        "multiline-ternary": "off",
        "new-cap": "error",
        "new-parens": "error",
        "newline-after-var": [
            "off",
            "always"
        ],
        "newline-before-return": "off",
        "newline-per-chained-call": "warn",
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-bitwise": "warn",
        "no-caller": "error",
        "no-catch-shadow": "off",
        "no-console": "off",
        "no-confusing-arrow": ["error", {"allowParens": true}],
        "no-continue": "warn",
        "no-debugger": "warn",
        "no-div-regex": "error",
        "no-duplicate-imports": "error",
        "no-else-return": "warn",
        "no-empty-function": "warn",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-extra-parens": "warn",
        "no-floating-decimal": "error",
        "no-global-assign": "error",
        "no-implicit-coercion": "warn",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-inline-comments": "warn",
        "no-invalid-this": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "error",
        "no-loop-func": "error",
        "no-magic-numbers": "warn",
        "no-mixed-operators": "error",
        "no-mixed-requires": "error",
        "no-multi-spaces": "off",
        "no-multi-str": "error",
        "no-multiple-empty-lines": "warn",
        "no-negated-condition": "off",
        "no-nested-ternary": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "warn",
        "no-path-concat": "error",
        "no-plusplus": "off",
        "no-process-env": "warn",
        "no-process-exit": "warn",
        "no-proto": "error",
        "no-prototype-builtins": "error",
        "no-restricted-globals": "error",
        "no-restricted-imports": "error",
        "no-restricted-modules": "error",
        "no-restricted-properties": "error",
        "no-restricted-syntax": "error",
        "no-return-assign": "warn",
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-shadow": "off",
        "no-shadow-restricted-names": "error",
        "no-spaced-func": "error",
        "no-sync": "error",
        "no-tabs": "warn",
        "no-template-curly-in-string": "error",
        "no-ternary": "off",
        "no-throw-literal": "error",
        "no-trailing-spaces": "warn",
        "no-undef-init": "error",
        "no-undefined": "error",
        "no-underscore-dangle": "off",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": "error",
        "no-unsafe-negation": "error",
        "no-unused-expressions": "warn",
        "no-unused-vars": "warn",
        "no-use-before-define": "warn",
        "no-useless-call": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-escape": "warn",
        "no-useless-rename": "error",
        "no-var": "off",
        "no-void": "error",
        "no-warning-comments": "off",
        "no-whitespace-before-property": "error",
        "no-with": "error",
        "object-curly-newline": "off",
        "object-curly-spacing": "off",
        "object-property-newline": "error",
        "object-shorthand": "off",
        "one-var": "off",
        "one-var-declaration-per-line": "error",
        "operator-assignment": "error",
        "operator-linebreak": "error",
        "padded-blocks": "off",
        "prefer-arrow-callback": "off",
        "prefer-const": "off",
        "prefer-numeric-literals": "error",
        "prefer-reflect": "off",
        "prefer-rest-params": "error",
        "prefer-spread": "warn",
        "quote-props": "off",
        "quotes": "off",
        "radix": "error",
        "require-jsdoc": "warn",
        "rest-spread-spacing": "error",
        "semi": "off",
        "semi-spacing": "error",
        "sort-imports": "warn",
        "sort-keys": [
            "off",
            "asc"
        ],
        "sort-vars": "warn",
        "space-before-blocks": "warn",
        "space-before-function-paren": "off",
        "space-in-parens": [
            "warn",
            "never"
        ],
        "space-infix-ops": "warn",
        "space-unary-ops": "error",
        "spaced-comment": "off",
        "strict": "off",
        "symbol-description": "error",
        "template-curly-spacing": "error",
        "unicode-bom": [
            "error",
            "never"
        ],
        "valid-jsdoc": "error",
        "vars-on-top": "error",
        "wrap-iife": "error",
        "wrap-regex": "error",
        "yield-star-spacing": "error",
        "yoda": "error"
    }
};

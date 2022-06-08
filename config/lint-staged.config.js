const lintStagedConfig = {
  '*.{json,jsonc,md,tson,yaml,yml}': 'prettier --write',
  '*.{ts,tsx}': [() => 'yarn test:type', 'eslint --cache --fix'],
}

export default lintStagedConfig

import ivangabrielePrettierConfig from '@ivangabriele/prettier-config' assert { type: 'json' }

/**
 * @type {import("prettier").Config}
 */
const config = {
  ...ivangabrielePrettierConfig,
  plugins: ['prettier-plugin-go-template'],
  overrides: [
    {
      files: ['*.html'],
      options: {
        parser: 'go-template',
      },
    },
  ],
}

export default config

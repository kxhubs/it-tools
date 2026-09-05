/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />
/// <reference types="naive-ui/volar" />
/// <reference types="@intlify/unplugin-vue-i18n/messages" />
/// <reference types="unplugin-icons/types/vue" />

interface ImportMetaEnv {
  VITE_PLAUSIBLE_API_HOST: string;
  VITE_PLAUSIBLE_DOMAIN: string;
  PACKAGE_VERSION: string;
  GIT_SHORT_SHA: string;
  PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

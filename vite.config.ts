import eslint from 'vite-plugin-eslint'
import webbundle from 'rollup-plugin-webbundle'

export default {
  plugins: [
    eslint(),
    webbundle({
      baseURL: '/',
      static: { dir: 'public' },
    })
  ]
}

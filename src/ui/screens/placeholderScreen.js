export function placeholderScreen(title) {
  return {
    async mount(root) {
      root.innerHTML = `<div class="screen"><h1>${title}</h1><p>Coming soon.</p><button onclick="history.back()">Back</button></div>`;
    },
    unmount() {},
  };
}
export default placeholderScreen;

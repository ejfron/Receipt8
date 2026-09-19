```vue
<script setup lang="ts"></script>

<template>
  <header class="topbar">
    <RouterLink class="brand" to="/" aria-label="Receipt8 home">
      <svg
        class="brand-mark"
        width="34"
        height="34"
        viewBox="0 0 80 78"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform="translate(8,10)">
          <path
            d="M4 8 Q4 0 12 0 H52 Q60 0 60 8 V50 L52 58 L44 50 L36 58 L28 50 L20 58 L12 50 L4 58 Z"
            fill="#f8f6f1"
          />

          <rect x="23" y="10.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="29" y="10.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="35" y="10.5" width="4.4" height="4.4" fill="#4fd1a5" />

          <rect x="17" y="16.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="41" y="16.5" width="4.4" height="4.4" fill="#4fd1a5" />

          <rect x="17" y="22.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="41" y="22.5" width="4.4" height="4.4" fill="#4fd1a5" />

          <rect x="23" y="28.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="29" y="28.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="35" y="28.5" width="4.4" height="4.4" fill="#4fd1a5" />

          <rect x="17" y="34.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="41" y="34.5" width="4.4" height="4.4" fill="#4fd1a5" />

          <rect x="17" y="40.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="41" y="40.5" width="4.4" height="4.4" fill="#4fd1a5" />

          <rect x="23" y="46.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="29" y="46.5" width="4.4" height="4.4" fill="#4fd1a5" />
          <rect x="35" y="46.5" width="4.4" height="4.4" fill="#4fd1a5" />
        </g>
      </svg>
    </RouterLink>

    <span class="spacer"></span>

    <nav class="nav" aria-label="Main navigation">
      <RouterLink to="/">Generator</RouterLink>
      <RouterLink to="/docs">Docs</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>

    <a
      class="upvote-btn"
      href="https://www.appbuildersph.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Upvote Receipt8 on Product Hunt"
    >
      <svg
        class="upvote-icon"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path d="M6 1 L11 9 L1 9 Z" />
      </svg>

      <span>Upvote</span>
    </a>

    <a
      class="github-btn"
      href="https://github.com/ejfron/Receipt8"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Receipt8 on GitHub"
    >
      <svg
        class="github-icon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.58 9.58 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z"
        />
      </svg>

      <span>Star</span>
    </a>
  </header>
</template>

<style scoped>
.upvote-btn,
.github-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 13px;
  box-sizing: border-box;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.upvote-btn {
  border: 1px solid rgba(79, 209, 165, 0.28);
  background: rgba(79, 209, 165, 0.08);
  color: #dffaf0;
}

.upvote-btn:hover {
  background: rgba(79, 209, 165, 0.14);
  border-color: rgba(79, 209, 165, 0.45);
  transform: translateY(-1px);
}

.upvote-icon {
  fill: #4fd1a5;
  flex-shrink: 0;
}

.github-btn {
  border: 1px solid rgba(248, 246, 241, 0.14);
  background: rgba(248, 246, 241, 0.05);
  color: rgba(248, 246, 241, 0.82);
}

.github-btn:hover {
  background: rgba(248, 246, 241, 0.1);
  border-color: rgba(248, 246, 241, 0.25);
  color: #f8f6f1;
  transform: translateY(-1px);
}

.github-icon {
  flex-shrink: 0;
}
</style>
```

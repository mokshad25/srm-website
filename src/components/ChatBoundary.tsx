import { Component } from 'react';
import type { ReactNode } from 'react';

/** A chat failure, including a chunk that won't load, must leave the rest of the page working. */
export default class ChatBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

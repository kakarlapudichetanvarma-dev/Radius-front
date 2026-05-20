import React, { Component } from 'react';

export default class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Something went wrong.
        </div>
      );
    }

    return this.props.children;
  }
}
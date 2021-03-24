import React from "react";

/**
 * Helper class to interpet values
 */
class Interpreter extends React.Component {
  visitor: any;
  constructor(visitor) {
    super(visitor);
    this.visitor = visitor;
  }

  interpret(nodes) {
    return this.visitor.run(nodes);
  }

  getValue() {
    return this.visitor.value;
  }
}

export default Interpreter;

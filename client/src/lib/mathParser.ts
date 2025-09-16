// Token types for the lexer
const TokenType = {
  NUMBER: 'NUMBER',
  VARIABLE: 'VARIABLE',
  CONSTANT: 'CONSTANT',
  OPERATOR: 'OPERATOR',
  FUNCTION: 'FUNCTION',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF: 'EOF'
} as const;

// Secure mathematical expression parser and evaluator
export class MathParser {

  private static readonly FUNCTIONS = new Set(['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'abs', 'exp']);
  private static readonly CONSTANTS = new Set(['e', 'pi']);
  private static readonly OPERATORS = new Set(['+', '-', '*', '/', '^']);

  // Tokenize the expression into safe mathematical tokens
  private static tokenize(expression: string): Array<{type: string, value: string, pos: number}> {
    const tokens = [];
    const expr = expression.replace(/\s+/g, ''); // Remove whitespace
    let i = 0;

    while (i < expr.length) {
      const char = expr[i];

      // Numbers (including decimals)
      if (/\d/.test(char) || char === '.') {
        let numStr = '';
        while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
          numStr += expr[i];
          i++;
        }
        if (numStr === '.') {
          throw new Error(`Invalid number format at position ${i}`);
        }
        tokens.push({ type: TokenType.NUMBER, value: numStr, pos: i - numStr.length });
        continue;
      }

      // Variables and functions/constants
      if (/[a-zA-Z]/.test(char)) {
        let identifier = '';
        while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
          identifier += expr[i];
          i++;
        }

        if (identifier === 'x') {
          tokens.push({ type: TokenType.VARIABLE, value: identifier, pos: i - identifier.length });
        } else if (this.FUNCTIONS.has(identifier)) {
          tokens.push({ type: TokenType.FUNCTION, value: identifier, pos: i - identifier.length });
        } else if (this.CONSTANTS.has(identifier)) {
          tokens.push({ type: TokenType.CONSTANT, value: identifier, pos: i - identifier.length });
        } else {
          throw new Error(`Unknown identifier '${identifier}' at position ${i - identifier.length}`);
        }
        continue;
      }

      // Operators
      if (this.OPERATORS.has(char)) {
        tokens.push({ type: TokenType.OPERATOR, value: char, pos: i });
        i++;
        continue;
      }

      // Parentheses
      if (char === '(') {
        tokens.push({ type: TokenType.LPAREN, value: char, pos: i });
        i++;
        continue;
      }

      if (char === ')') {
        tokens.push({ type: TokenType.RPAREN, value: char, pos: i });
        i++;
        continue;
      }

      throw new Error(`Unexpected character '${char}' at position ${i}`);
    }

    tokens.push({ type: TokenType.EOF, value: '', pos: expr.length });
    return tokens;
  }

  // Secure expression evaluator using recursive descent parsing
  static evaluate(expression: string, x: number): number {
    try {
      const tokens = this.tokenize(expression);
      const parser = new ExpressionParser(tokens, x);
      const result = parser.parseExpression();
      
      if (!parser.isAtEnd()) {
        throw new Error(`Unexpected token at position ${parser.getCurrentToken().pos}`);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Invalid expression: ${expression}. ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Parse expression for plotting (returns array of points)
  static generatePoints(expression: string, xMin: number, xMax: number, steps: number = 1000): Array<{x: number, y: number}> {
    const points: Array<{x: number, y: number}> = [];
    const stepSize = (xMax - xMin) / steps;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * stepSize;
      try {
        const y = this.evaluate(expression, x);
        if (isFinite(y)) {
          points.push({ x, y });
        }
      } catch (error) {
        // Skip invalid points
      }
    }

    return points;
  }

  // Validate expression syntax
  static isValidExpression(expression: string): boolean {
    try {
      this.evaluate(expression, 1);
      return true;
    } catch {
      return false;
    }
  }

  // Get common mathematical functions
  static getPresetFunctions() {
    return [
      { expression: 'x^2 + 2*x - 1', name: 'Quadratic', description: 'x² + 2x - 1' },
      { expression: 'sin(x)', name: 'Sine', description: 'sin(x)' },
      { expression: 'cos(x)', name: 'Cosine', description: 'cos(x)' },
      { expression: 'Math.exp(x)', name: 'Exponential', description: 'eˣ' },
      { expression: 'ln(x)', name: 'Natural Log', description: 'ln(x)' },
      { expression: 'x^3 - 3*x^2 + 2*x', name: 'Cubic', description: 'x³ - 3x² + 2x' },
      { expression: '1/x', name: 'Reciprocal', description: '1/x' },
      { expression: 'sqrt(x)', name: 'Square Root', description: '√x' }
    ];
  }
}

// Recursive descent parser for mathematical expressions
class ExpressionParser {
  private tokens: Array<{type: string, value: string, pos: number}>;
  private current: number = 0;
  private x: number;

  constructor(tokens: Array<{type: string, value: string, pos: number}>, x: number) {
    this.tokens = tokens;
    this.x = x;
  }

  getCurrentToken() {
    return this.tokens[this.current];
  }

  isAtEnd() {
    return this.getCurrentToken().type === TokenType.EOF;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.tokens[this.current - 1];
  }

  check(type: string) {
    if (this.isAtEnd()) return false;
    return this.getCurrentToken().type === type;
  }

  match(...types: string[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  // Parse expression with operator precedence
  parseExpression(): number {
    return this.parseAddition();
  }

  // Addition and subtraction (lowest precedence)
  parseAddition(): number {
    let expr = this.parseMultiplication();

    while (this.match(TokenType.OPERATOR)) {
      const operator = this.tokens[this.current - 1].value;
      if (operator === '+' || operator === '-') {
        const right = this.parseMultiplication();
        expr = operator === '+' ? expr + right : expr - right;
      } else {
        // Put the token back
        this.current--;
        break;
      }
    }

    return expr;
  }

  // Multiplication and division
  parseMultiplication(): number {
    let expr = this.parseExponentiation();

    while (this.match(TokenType.OPERATOR)) {
      const operator = this.tokens[this.current - 1].value;
      if (operator === '*' || operator === '/') {
        const right = this.parseExponentiation();
        if (operator === '/' && right === 0) {
          throw new Error('Division by zero');
        }
        expr = operator === '*' ? expr * right : expr / right;
      } else {
        // Put the token back
        this.current--;
        break;
      }
    }

    return expr;
  }

  // Exponentiation (right-associative, highest precedence for binary operators)
  parseExponentiation(): number {
    let expr = this.parseUnary();

    if (this.match(TokenType.OPERATOR)) {
      const operator = this.tokens[this.current - 1].value;
      if (operator === '^') {
        const right = this.parseExponentiation(); // Right-associative
        expr = Math.pow(expr, right);
      } else {
        // Put the token back
        this.current--;
      }
    }

    return expr;
  }

  // Unary operators and function calls
  parseUnary(): number {
    if (this.match(TokenType.OPERATOR)) {
      const operator = this.tokens[this.current - 1].value;
      if (operator === '-') {
        return -this.parseUnary();
      } else if (operator === '+') {
        return this.parseUnary();
      } else {
        throw new Error(`Unexpected unary operator '${operator}'`);
      }
    }

    return this.parsePrimary();
  }

  // Primary expressions (numbers, variables, constants, functions, parentheses)
  parsePrimary(): number {
    // Numbers
    if (this.match(TokenType.NUMBER)) {
      const value = this.tokens[this.current - 1].value;
      return parseFloat(value);
    }

    // Variables
    if (this.match(TokenType.VARIABLE)) {
      return this.x;
    }

    // Constants
    if (this.match(TokenType.CONSTANT)) {
      const constant = this.tokens[this.current - 1].value;
      switch (constant) {
        case 'e':
          return Math.E;
        case 'pi':
          return Math.PI;
        default:
          throw new Error(`Unknown constant '${constant}'`);
      }
    }

    // Functions
    if (this.match(TokenType.FUNCTION)) {
      const functionName = this.tokens[this.current - 1].value;
      
      if (!this.match(TokenType.LPAREN)) {
        throw new Error(`Expected '(' after function '${functionName}'`);
      }

      const argument = this.parseExpression();

      if (!this.match(TokenType.RPAREN)) {
        throw new Error(`Expected ')' after function argument`);
      }

      return this.evaluateFunction(functionName, argument);
    }

    // Parenthesized expressions
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      if (!this.match(TokenType.RPAREN)) {
        throw new Error(`Expected ')' after expression`);
      }
      return expr;
    }

    // Implicit multiplication for cases like "2x" or "x2" - check if next token is a number/variable
    if (this.check(TokenType.NUMBER) || this.check(TokenType.VARIABLE)) {
      // This case should be handled by proper tokenization
      throw new Error(`Unexpected token '${this.getCurrentToken().value}'`);
    }

    throw new Error(`Unexpected token '${this.getCurrentToken().value}' at position ${this.getCurrentToken().pos}`);
  }

  // Evaluate mathematical functions safely
  evaluateFunction(functionName: string, argument: number): number {
    switch (functionName) {
      case 'sin':
        return Math.sin(argument);
      case 'cos':
        return Math.cos(argument);
      case 'tan':
        return Math.tan(argument);
      case 'ln':
        if (argument <= 0) {
          throw new Error('Natural logarithm of non-positive number');
        }
        return Math.log(argument);
      case 'log':
        if (argument <= 0) {
          throw new Error('Logarithm of non-positive number');
        }
        return Math.log10(argument);
      case 'sqrt':
        if (argument < 0) {
          throw new Error('Square root of negative number');
        }
        return Math.sqrt(argument);
      case 'abs':
        return Math.abs(argument);
      case 'exp':
        return Math.exp(argument);
      default:
        throw new Error(`Unknown function '${functionName}'`);
    }
  }
}

// Mustache template renderer function
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mustache(template, self, parent, invert) {
    var render = mustache;
    var output = "";
    var i;

    function get(ctx, path) {
        path = path.pop ? path : path.split(".");
        ctx = ctx[path.shift()];
        ctx = ctx != null ? ctx : "";
        return (0 in path) ? get(ctx, path) : ctx;
    }

    self = Array.isArray(self) ? self : (self ? [self] : []);
    self = invert ? (0 in self) ? [] : [1] : self;

    for (i = 0; i < self.length; i++) {
        var childCode = '';
        var depth = 0;
        var inverted;
        var ctx = (typeof self[i] == "object") ? self[i] : {};
        ctx = Object.assign({}, parent, ctx);
        ctx[""] = {"": self[i]};

        template.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g,
            function(match, code, y, z, close, invert, name) {
                if (!depth) {
                    output += code.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g,
                        function(match, raw, comment, isRaw, partial, name) {
                            return raw ? get(ctx, raw)
                                : isRaw ? get(ctx, name)
                                : partial ? render(get(ctx, name), ctx)
                                : !comment ? escapeHtml(get(ctx, name))
                                : "";
                        }
                    );
                    inverted = invert;
                } else {
                    childCode += depth && !close || depth > 1 ? match : code;
                }
                if (close) {
                    if (!--depth) {
                        name = get(ctx, name);
                        if (/^f/.test(typeof name)) {
                            output += name.call(ctx, childCode, function(template) {
                                return render(template, ctx);
                            });
                        } else {
                            output += render(childCode, name, ctx, inverted);
                        }
                        childCode = "";
                    }
                } else {
                    ++depth;
                }
            }
        );
    }
    return output;
}

// Test file for mustache template functionality
// First, insert the mustache function using the 'mustache' snippet
// Then, insert the example using the 'mustache-example' snippet

// Test 1: Basic variable interpolation
const basicTemplate = `
  Hello {{name}}!
  Your age is {{age}}
  You are {{#isAdult}}an adult{{/isAdult}}{{^isAdult}}a minor{{/isAdult}}
`;

const basicContext = {
  name: "John",
  age: 25,
  isAdult: true
};

console.log("Test 1 - Basic Template:");
console.log(mustache(basicTemplate, basicContext));
console.log("\n---\n");

// Test 2: Nested objects and arrays
const nestedTemplate = `
  User Profile:
  Name: {{user.name}}
  Address: {{user.address.street}}, {{user.address.city}}
  Skills: {{#user.skills}}{{.}}, {{/user.skills}}
`;

const nestedContext = {
  user: {
    name: "Jane",
    address: {
      street: "123 Main St",
      city: "London"
    },
    skills: ["JavaScript", "HTML", "CSS"]
  }
};

console.log("Test 2 - Nested Objects:");
console.log(mustache(nestedTemplate, nestedContext));
console.log("\n---\n");

// Test 3: Conditional sections and lambdas
const conditionalTemplate = `
  {{#hasItems}}
    Items in cart:
    {{#items}}
      - {{name}} ({{price}})
    {{/items}}
    Total: {{total}}
  {{/hasItems}}
  {{^hasItems}}
    Your cart is empty
  {{/hasItems}}
  {{#formatDate}}
    Last updated: {{.}}
  {{/formatDate}}
`;

const conditionalContext = {
  hasItems: true,
  items: [
    { name: "Book", price: "$10" },
    { name: "Pen", price: "$2" }
  ],
  total: "$12",
  formatDate: function(text) {
    return new Date().toLocaleDateString();
  }
};

console.log("Test 3 - Conditionals and Lambdas:");
console.log(mustache(conditionalTemplate, conditionalContext));
console.log("\n---\n");

// Test 4: Raw output and escaping
const rawTemplate = `
  Escaped: {{html}}
  Raw: {{{html}}}
  Also raw: {{&html}}
`;

const rawContext = {
  html: "<div>Hello <script>alert('world')</script></div>"
};

console.log("Test 4 - Raw Output and Escaping:");
console.log(mustache(rawTemplate, rawContext));
console.log("\n---\n");

// Test 5: Comments and partials
const partialTemplate = `
  {{! This is a comment }}
  {{>header}}
  Main content here
  {{>footer}}
`;

const partials = {
  header: "=== Header ===\n",
  footer: "\n=== Footer ==="
};

const partialContext = {
  title: "My Page"
};

console.log("Test 5 - Comments and Partials:");
// Note: This test requires the partials to be available in the context
console.log(mustache(partialTemplate, partialContext, partials));
console.log("\n---\n");

// Run all tests
console.log("All tests completed!"); 
import _ from 'lodash';

const labelRows = (labels, array) => {
  const objects = array.map((row) => row.reduce((obj, value, i) => {
    obj[labels[i]] = value;
    return obj;
  }, {}));

  const ids = new Set();
  objects.forEach(({id}) => {
    if (ids.has(id)) {
      throw new Error('Duplicate ID: ' + id);
    }
    ids.add(id)
  });

  return objects;
};

const categories = labelRows(['id', 'name', 'parentID'], [
  [1, 'General'],
  [2, 'README', 1],
  [3, 'Structure', 1],
  [4, 'Security', 1],
  [5, 'User Input', 4],
  [6, 'Passwords and secure tokens', 4],
  [7, 'Code Style', 1],
  [8, 'Testing', 1],
  [9, 'Node.js'],
  [10, 'Structure', 9],
  [11, 'Security', 9],
  [12, 'Language Features', 9],
  [13, 'All Versions', 12],
  [14, 'Supporting only Node.js >= 4', 12],
  [15, 'Supporting only Node.js >= 6', 12],
  [16, 'Code Style', 9]
]);

const tags = labelRows(['id', 'name'], [
  [1, 'Modularity'],
  [2, 'Readability'],
  [3, 'Standards Conformity'],
  [4, 'Conciseness'],
  [5, 'Maintainability'],
  [6, 'Test Coverage'],
  [7, 'Elegance']
]);

const points = labelRows(['id', 'text', 'categoryID', 'tags'], [
  [1, 'Provide sufficient instructions on how to set up the project.', 2, [[5, 1]]],
  [2, 'Choose design patterns that are appropriate for the given problem.', 3, [[2, 1], [5, 1], [7, 1]]],
  [3, 'Large files should be subdivided into several smaller files, separated by responsibility. Same goes for large functions and functions with many parameters.', 3, [[1, 1], [2, 1], [5, 1], [7, 1]]],
  [4, 'Repeating a few lines of (almost) equivalent code once is usually okay but when it happens more than once, extract it into a function. Declare constant values once to prevent repetition and increase readability.', 3, [[1, 1], [2, 1], [4, 1], [5, 1], [7, 1]]],
  [5, 'Minimize nesting of blocks. This relates to functions as well as to conditional/loop-blocks. Sometimes the solution is simply early, other times it requires dividing the function.', 3, [[2, 1], [4, 1], [5, 1], [7, 1]]],
  [6, 'Descriptive short names (when in doubt prefer longer more expressive names). Avoid abbreviations that are not extremely common and well-known in the domain.', 3, [[2, 1], [4, 1], [5, 1], [7, 1]]],
  [7, 'Circular dependencies are almost always bad', 3, [[1, 2], [2, 1], [5, 1], [7, 1]]],
  [8, 'Document possibly confusing sections of code.', 3, [[2, 1], [5, 1]]],
  [9, 'User input that leads to some form of dynamic data access to (security-)critical sources should be properly guarded (e.g. prepared statements). The same goes for user input that is shown to users. If the output medium is HTML, the user string should be inserted as a text node and almost never directly inserted as HTML (and in that case tags need to be properly escaped). The exact mechanism depends on the FE framework/templating library.\nAlso don’t use outdated versions of libraries that directly handle user input.', 5, [[5, 2]]],
  [10, 'For secure hashing use a standard secure library, like bcrypt.', 6, [[3, 1], [5, 1]]],
  [11, 'Algos like MD5 are not acceptable here.', 6, [[5, 2]]],
  [12, 'Check for consistency, and recommend a linting-tool when consistency is not given. Personal preference (tabs vs spaces, indentation levels, etc.) shouldn’t affect the review.', 7, [[2, 1], [5, 0], [7, 0]]],
  [13, 'If the language used does have one accepted code style in some regard (which should be easy to prove with an authoritative source) it does affect Standards Conformity.', 7, [[3, 1]]],
  [14, '100% coverage is rarely the most sensible option, especially for code that is still heavily changing from milestone to milestone. The amount of testing required depends on your assessment. APIs and code containing complex logic should usually be tested.', 8, [[6, 2]]],
  [15, 'Catch Promises that can be expected to fail. Also be careful to catch at the right place.', 10, [[5, 1]]],
  [16, 'In a request/response context, use async functions to not block the event-loop.', 10, [[5, 1]]],
  [17, 'Never use eval.', 11, [[5, 2]]],
  [18, '- dot notation when accessing properties\n- “parseInt” with a radix for parsing strings', 13, [[3, 1]]],
  [19, 'Don’t use exception handling for catching programmer errors (only for operational errors).', 13, [[5, 1]]],
  [20, 'When programmatically building up strings, use template strings instead of concatenation.', 14, [[2, 1], [4, 1], [7, 1], [3, 0]]],
  [21, '“const” and “let” should used in favor of “var”. Also when the variable isn’t changed, “const” should always be used.', 15, [[3, 0], [5, 0]]],
  [22, 'Destructuring, object method shorthands & arrow functions should be used where appropriate. An exception the latter is when dynamic scoping/rebinding is needed.', 15, [[2, 1], [4, 1], [7, 1], [3, 0]]],
  [23, 'Single-statement multi-line blocks should always have braces:', 16, [[5, 0]]]
]);

const buildCategoryTree = (parentID) => (
  categories.filter((c) => c.parentID === parentID).map(({id, name}) => ({
      id, name,
      points: points.filter((p) => p.categoryID === id).map(({id, text, tags: pointTags}) => ({
        id, text,
        tagsByLevel: _(pointTags)
          .groupBy(([id, level]) => level)
          .mapValues((levelTags) => levelTags.map(([id]) => tags.find((t) => id === t.id)))
          .toPairs()
          .sortBy(([level]) => -level)
          .value()
      })),
      children: buildCategoryTree(id)
  }))
);

export const categoryTree = buildCategoryTree();

const getCategoryPath = (id) => {
  if (!id) return [];
  const category = categories.find((category) => category.id === id);
  return [...getCategoryPath(category.parentID), category.name];
};
export const pointsByTagLevels = tags.map((tag) => ({
  ...tag,
  levelPoints: _(points)
    .filter((point) => point.tags.find(([tagID]) => tagID === tag.id))
    .groupBy((point) => point.tags.find(([tagID]) => tagID === tag.id)[1])
    .toPairs()
    .sortBy(([level]) => -level)
    .map(([level, points]) => [
      level,
      points.map((point) => ({
        ...point,
        categoryPath: getCategoryPath(point.categoryID)
      }))
    ])
    .value()
}));
# vue-email-dropdown

# Demo

![Demo](https://raw.githubusercontent.com/DannyFeliz/vue-email-dropdown/master/demo/demo.gif)

# Props

<table>
    <thead>
    <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Required</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>domains</td>
        <td>Array</td>
        <td>True</td>
        <td>-</td>
        <td>All domains that should be used to make a domain suggestions.</td>
    </tr>
    <tr>
        <td>defaultDomains</td>
        <td>Array</td>
        <td>False</td>
        <td>[]</td>
        <td>Default domains that should be displayed once `@` is typed.</td>
    </tr>
    <tr>
        <td>initialValue</td>
        <td>String</td>
        <td>False</td>
        <td>""</td>
        <td>Initial value for the email field.</td>
    </tr>
    <tr>
        <td>maxSuggestions</td>
        <td>Number</td>
        <td>False</td>
        <td>4</td>
        <td>How many domain suggestions should displayed.</td>
    </tr>
    </tbody>
</table>

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

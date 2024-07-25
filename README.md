# fivem-serverlist-api
Fetch data from the server list without all the hazzle.

## Why?
It's simple. [Cfx](https://cfx.re/) doesn't provide an 'easy to use' API for their server list.

## Disclaimer
#### Legal Notice
This project is intended for educational and informational purposes only. It is not affiliated with, endorsed, or sponsored by any third-party entities mentioned or referenced in the code. The data accessed and processed by this project is sourced from publicly available endpoints and is used in compliance with fair use principles.

#### Attribution
This project utilizes source code from the [CitizenFX/FiveM](https://github.com/citizenfx/fivem) repository. Specific code sections adapted from the [./ext/cfx-ui](https://github.com/citizenfx/fivem/tree/master/ext/cfx-ui/) module. I extend my gratitude to the CitizenFX Collective and the original authors for their contributions and the resources they provide.

#### License
This project is licensed under the MIT License. Portions of the codebase are adapted from the [CitizenFX/FiveM](https://github.com/citizenfx/fivem) project, which is licensed under the terms provided in the [CitizenFX/FiveM License](https://github.com/citizenfx/fivem/blob/master/code/LICENSE). Please review the CitizenFX license for more information regarding the terms and conditions of use.

#### Contact
For any legal questions or concerns regarding this project or its usage, please contact me (the author) at zuntiedev@gmail.com.
<br>

## API Reference

### Fetch Servers by Locale

```http
GET /fetchServersByLocale/:locale
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `locale`  | `string` | **Required**. The locale to filter servers by |

#### Example

```sh
curl https://fivem-sl-api.onrender.com/fetchServersByLocale/en-US
```

---

### Fetch Server by EndPoint

```http
GET /fetchServerByEndPoint/:endpoint
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `endpoint`| `string` | **Required**. The endpoint of the server |

#### Example

```sh
curl https://fivem-sl-api.onrender.com/fetchServerByEndPoint/3lamjz
```

---

### Fetch All Servers

```http
GET /fetchServers
```

#### Example

```sh
curl https://fivem-sl-api.onrender.com/fetchServers
```

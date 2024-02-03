# Бэкенд для codewars-like приложения

Для работы с функционалом peer-to-peer соединения реализован API на веб сокетах. Для данных о задачах и пользователей используется REST API. Для всех запросов с телом формат тела запроса должен быть JSON, если в описании запроса явно не указано иное.

## REST API

### POST /api/user

> Формат тела запроса должен быть FormData.

Создаёт нового пользователя. На вход принимает объект следующего вида:

Формат запроса:
```ts
{
  avatar?: File;
  hash: string;
  username: string;
}
```

Возвращает объект следующего вида, где uuid - ID созданного пользователя:

Формат ответа:
```ts
{
  uuid: string;
}
```

### POST /api/auth

Авторизуется с указанным именем пользователя и хэшем пароля.

Формат запроса:
```ts
{
  hash: string;
  username: string;
}
```

Возвращает JWT.

Формат ответа:
```ts
{
  access_token: string;
}
```

### GET /api/auth/user

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

Возвращает данные авторизованного пользователя.

Формат ответа:
```ts
{
  avatar: string;
  username: string;
  uuid: string;
}
```

### PUT /api/auth/user

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

> Формат тела запроса должен быть FormData.

Обновляет данные пользователя. Все поля запроса необязательны.

Формат запроса:
```ts
{
  avatar?: File;
  hash?: string;
  username?: string;
  uuid?: string;
}
```

Формат ответа:
```ts
{
  avatar: string;
  hash: string;
  username: string;
  uuid: string;
}
```

### GET /api/tasks

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

Возвращает список задач. `results` - кейсы, массив пар вида `[string[], string]`, где первый элемент - массив JSON-представлений аргументов для кейса, второй - ожидаемый результат.

Поддерживает различные варианты опциональной фильтрации списка задач в ответе (если не передан ни один из них, будут возвращены все задачи):

|Query-параметр|Возможные значения|Описание|Зависит от других параметров|
|---|---|---|---|
|`tag`|`'my'`|Если установлен параметр tag=my, в овтете будут возвращены только задачи, созданные текущим пользователем|нет|
|`search`|`string`|Осуществляет регистронезависимый поиск в полях `title` и `description` задачи|нет|
|`sort`|`'createdAt' \| 'description' \| 'title' \| 'updatedAt'`|Осуществляет сортировку по одному из указанных полей|нет|
|`order`|`'ASC' \| 'DESC'`|Указывает направление сортировки, если не передано, по умолчанию подразумевается `'ASC'`|`sort`|
|`page`|`number`|Номер страницы для пагинации, если не передан, будут возвращены все найденные элементы|нет|
|`size`|`number`|Размер пагинации, если не передан, по умолчанию подразумевается 10|`page`|

> Пример запроса со всеми параметрами фильтрации: `/api/tasks?tag=my&search=умножение&sort=updatedAt&order=ASC&page=3&size=10`

Формат ответа:
```ts
Array<{
  description: string;
  results: [string[], string][];
  title: string;
  uuid: string;
}>
```

### POST /api/tasks

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

Создаёт одну или несколько новых задач. Результирующий объект содержит два поля: `inserted` - массив добавленных задач, и `omitted` - массив задач, которые не удалось добавить.

Формат запроса:
```ts
/**
 * @see Task
 */
{
  description: string;
  results: [string, string][];
  title: string;
} | Array<{
  description: string;
  results: [string, string][];
  title: string;
}>
```

Формат ответа:
```ts
/**
 * @see CreateTasksResponseDto
 */
{
  inserted: Array<{
    description: string;
    results: [string, string][];
    title: string;
    uuid: string;
  }>;
  omitted: Array<{
    description: string;
    results: [string, string][];
    title: string;
    uuid: string;
  }>;
}
```

### GET /api/tasks/${taskUuid}

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

Возвращает данные задачи по её uuid.

Формат ответа:
```ts
{
  description: string;
  results: [string, string][];
  title: string;
  uuid: string;
}
```

### PUT /api/tasks/${taskUuid}

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

> Требует наличия прав на операцию.

Обновляет информацию об указанной задаче.

Формат запроса:
```ts
/**
 * @see Task
 */
{
  description?: string;
  results?: [string, string][];
  title?: string;
};
```

Формат ответа:
```ts
/**
 * @see Task
 */
{
  description: string;
  results: [string, string][];
  title: string;
  uuid: string;
}
```

### DELETE /api/tasks/${taskUuid}

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

> Требует наличия прав на операцию.

Удаляет задачу. Возвращает `true` в случае успеха, иначе выбрасывает ошибку с кодом 10 (см. ниже).

Формат ответа:
```ts
boolean
```

### POST /api/connector

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

Привязывает открытое в сервисе-коннекторе подключение к авторизованному пользователю.

После открытия WS-подключения клиент получает сообщение `connect` со значением `data`, равным `connId` только что созданного подключения. Этот `connId` следует передать в теле данного запроса для однозначного установления связи с авторизованным пользователем.

> Обычно связь между пользователем и подключением удаляется при разрыве WS-соединения, дополнительно очистка всех связей с подключениями для данного пользователя будет выполнена при обработке данного запроса. Таким образом, можно сказать, что каждому пользователю соответствует только одно открытое подключение.

Формат запроса:
```ts
{
  connId: string;
}
```

### GET /api/connector/${peerConnUuid}

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

Возвращает имя и аватар пользователя по идентификатору актуального подключения.

Формат ответа:
```ts
{
  avatar: string;
  username: string;
}
```

### GET /api/connector/validate

> Требует авторизации с помощью JWT: заголовок `Authorization` формата `Bearer ${jwt}`.

Проверяет отсутствие активного подключения для авторизованного пользователя. Если подключений нет, возвращает `null`, если подключение было найдено, выбрасывает ошибку с внутр. кодом 8 (см. ниже).

Формат ответа:
```ts
null
```

### GET /api/files/${filename}

Открывает ранее загруженный при помощи приложения файл (например, загруженный при помощи запросов на создание и редактирование пользователя аватар). Если расширение запрошенного файла не является поддерживаемым (для изображений — 'png', 'jpg', 'jpeg' либо 'webp'), выбрасывает ошибку с кодом 11 (см. ниже). Если файл не был найден — ошибку с кодом 12. В случае возникновения других ошибок, связанных с получением файла, будет выброшена ошибка с кодом 13.

Формат ответа:
```
Файл с соответствующим mime типом.
```

## WS API

Подключение к WS-серверу целесообразно непосредственно при входе в процесс соревнования. Подключение инициирует поиск оппонентов, размещая пользователя в виртуальной очереди к соответствующей задачи.

Т. к. подключения имеют смысл только в контексте конкретной задачи, подключение к WS-серверу необходимо осуществлять в следующем формате:
```ts
const socket = new WebSocket(`ws://example-api-url.com:12345?taskId=${taskUuid}`);
```

Далее, как только в очереди появится ещё один свободный пользователь, ищущий оппонента для той же задачи, пользователи будут соединены. После того, как оба отметят свою готовность, стартует соревнование.

Бэкенд не предоставляет механизма проверки заданий, однако позволяет зафиксировать пользователя как победителя, автоматически отправив сопернику сообщение о поражении.

Полный список доступных сообщений приведён далее.

## Принимаемые сообщения

### pair

> формат: `{ event: 'pair', data: string }`

Сообщение приходит пользователю, как только находится подходящий соперник. В качестве `data` возвращает `connId` оппонента.

### ready

> формат: `{ event: 'ready' }`

Позволяет передать противнику сигнал о готовности. Автоматически отправляет противнику аналогичное сообщение.

### retry

> формат: `{ event: 'retry' }`

Если пользователь вышел из соревнования и не находится на текущий момент в очереди, возвращает его в очередь по выбранному заданию.

### push

> формат: `{ event: 'push', data: string }`

Сообщение пользовательского ввода (расчитано на работу с событием input поля ввода кода пользователя). Автоматически отправляет противнику сообщение `pull` вида `{ event: 'push', data: string }`, где `data` - тот же текст, что пользователь прислал в сообщении `push`.

### attempt

> формат: `{ event: 'attempt' }`

Фиксирует попытку выполнения своего кода пользователем. Позволяет вести учет количества попыток для обоих пользователей. Автоматически отправляет противнику аналогичное сообщение.

### win

> формат: `{ event: 'win' }`

Сообщение о победе пользователя. Ничего не производит, только автмоатически отправляет противнику сообщение `lose` вида `{ event: 'lose' }`.

### decline

> формат: `{ event: 'decline' }`

Разрывает соединение с противником, автоматически прекращая соревнование и возвращая противника в очередь к задаче. Не возвращает в очередь самого пользователя (для этого предусмотрено отдельное сообщение `retry`). После обработки провоцирует вызов сообщения `disconnect` противнику.

## Отправляемые сообщения

### connect

> формат: `{ event: 'connect', data: string }`

Сообщение отправляется пользователю при его успешном подключении к шлюзу. В качестве пейлода передаётся `connId` нового подключения.

### disconnect

> формат: `{ event: 'disconnect' }`

Сообщение отправляется противнику при разрыве соединения (по любой причине: намеренное отключение сокета, непреднамеренная потеря соединения, сообщение `decline` от игрока).

### pull

> формат: `{ event: 'pull', data: string }`

Передаёт текущий текст игрока противнику, вызывается отправкой игроком сообещния `push`.

### attempt

> формат: `{ event: 'attempt' }`

Вызывается отправкой пользователем аналогичного сообщения серверу, отправляется противнику. Сигнализирует о попытке выполнения кода, успешной или нет.

### lose

> формат: `{ event: 'lose' }`

Вызывается отправкой пользователем сообщения `win` серверу, отправляется противнику. Сигнализирует о победе пользователя.

## Значения кодов ошибок

В случае возникновения ошибок, API выбрасывает исключения в виде HTTP ошибок в определенном формате, приведенном ниже. В дополнение к коду HTTP-состояния, ошибке присваивается внутренний системный код и сообщение, объясняющее природу ошибки. Человекочитаемые сообщения, адресованные конечному пользователю, должны предоставляться клиентом.
Формат ошибок:
```ts
/**
 * @see Errors
 */
{
  code: Errors; // целочисленный код, начиная с единицы 
  message: string; // внутреннее системное сообщение, упрощающее понимание природы ошибки
}
```
### Таблица кодов ошибок с описанием и их соответствию кодам состояния HTTP:
|Код состояния HTTP|Внутренний код|Описание ошибки|
|---|---|---|
|403|1|Ошибка авторизации|
|400|2|Ошибка в теле запроса|
|403|3|Неверный пароль|
|404|4|Пользователь не существует|
|400|5|Пользователь уже существует (для регистрации)|
|404|6|Задачи с таким UUID не существует|
|400|7|Задача с таким названием уже существует|
|400|8|Пользователь уже имеет активное подключение|
|403|9|Недостаточно прав для выполнения запрошенной операции|
|404|10|Ошибка при удалении|
|400|11|Неподдерживаемое разрешение файла|
|404|12|Файл не найден|
|500|13|Неизвестная ошибка при прочтении файла|
|422|14|Файл не прошёл валидацию|
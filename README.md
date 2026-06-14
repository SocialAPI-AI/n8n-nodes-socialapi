# n8n-nodes-socialapi

[n8n](https://n8n.io) community nodes for [SocialAPI.ai](https://social-api.ai). Manage social accounts, publish posts, work the unified inbox (comments, DMs, reviews, mentions), and trigger workflows on real-time events.

## Installation

Install from inside n8n:

1. Open **Settings** (gear icon, bottom-left).
2. Go to **Community Nodes**.
3. Click **Install a community node**.
4. Enter `n8n-nodes-socialapi` and click **Install**.

The **SocialAPI** action node and the **SocialAPI Trigger** node will appear in your node panel after installation.

## Credential setup

1. Log in to [SocialAPI.ai](https://social-api.ai) and open **Settings > API Keys**.
2. Click **Create key**. Your key starts with `sapi_key_`. Copy it now (it is shown only once).
3. In n8n, open **Credentials** and create a new **SocialAPI API** credential.
4. Paste your key into **API Key** and leave **Base URL** at the default (`https://api.social-api.ai`).
5. Click **Test** to verify the credential hits your account.

## Resource and operation reference

### Account

| Operation | Description |
|---|---|
| Connect | Start an OAuth connection for a platform |
| Disconnect | Disconnect a connected account |
| Exchange OAuth | Exchange an authorization code for a token |
| Get Limits | Get usage limits for an account |
| Get Many | List connected accounts (optionally filtered by Brand ID) |
| List Pages | List pages associated with an account |

### Post

| Operation | Description |
|---|---|
| Create | Create a post (draft, scheduled, or publish-now) |
| Delete | Delete a post |
| Get | Get a single post by ID |
| Get Constraints | Fetch per-platform publishing constraints |
| Get Many | List posts with optional filters (status, platform, date range, search) |
| Get Metrics | Refresh and return live engagement metrics for a post |
| Publish Draft | Publish a saved draft immediately |
| Retry | Retry a failed post delivery |
| Unpublish | Unpublish a published post (optionally from specific accounts only) |
| Update | Update a post's text or scheduled time |
| Validate | Validate post content against platform constraints before publishing |

### Comment

| Operation | Description |
|---|---|
| Delete | Delete a comment |
| Get Many | Get comments on a specific post |
| Get Replies | Get replies to a specific comment |
| Hide | Hide a comment |
| Like | Like a comment |
| List Commented Posts | List inbox posts that have comments |
| Private Reply | Send a private DM reply to a comment author |
| Reply | Reply to a comment (at post level or as a thread reply) |
| Unhide | Unhide a previously hidden comment |
| Unlike | Unlike a comment |

### Conversation (DM)

| Operation | Description |
|---|---|
| Get | Get a single conversation by ID |
| Get Many | List conversations (filterable by account or platform) |
| List Messages | List messages in a conversation |
| Mark Read | Mark a conversation as read |
| Send Message | Send a direct message in a conversation |
| Update | Update conversation metadata (e.g. mark read/unread) |

### Review

| Operation | Description |
|---|---|
| Get Many | List reviews (filterable by account) |
| Reply | Post a reply to a review |

Note: only listing and replying are available over the API. Update/delete reply are not supported.

### Mention

| Operation | Description |
|---|---|
| Get Many | List mentions for a specific account |

### Brand

| Operation | Description |
|---|---|
| Create | Create a brand (a logical grouping of accounts) |
| Delete | Delete a brand |
| Get Many | List all brands |
| Update | Rename a brand |

Note: there is no get-single-brand operation. Use Get Many to retrieve brand details.

### Media

| Operation | Description |
|---|---|
| Delete | Delete a media item |
| Get Many | List uploaded media items |
| Get Storage Usage | Get current storage usage for your account |
| Upload | Upload a file using the presigned flow (presign, PUT to storage, verify). Supports binary data from a previous node or a URL. No file size cap. |

## SocialAPI Trigger

The **SocialAPI Trigger** node starts a workflow when a SocialAPI event fires (e.g. `comment.received`, `dm.received`, `review.received`, `post.published`).

**Important: the trigger requires a publicly reachable n8n instance.** SocialAPI must be able to deliver HTTP POST requests to your n8n webhook URL. Use n8n Cloud, or a self-hosted instance with a public domain and HTTPS. The trigger will not work from a local `localhost` instance unless you expose it via a tunnel (e.g. ngrok).

When a workflow using the trigger node is activated, it registers a webhook with SocialAPI automatically. When you deactivate the workflow, the webhook is removed.

## Example workflows

### 1. Publish a scheduled post to Instagram and LinkedIn

This workflow creates a post scheduled for a future date, targeting multiple connected accounts.

1. Add a **Manual Trigger** (or any trigger that provides post content).
2. Add a **SocialAPI** node. Set **Resource** to `Post` and **Operation** to `Create`.
3. Fill in **Text** with the post body.
4. Under **Targets**, add one entry per account: set **Account ID** to your Instagram account ID and another entry for your LinkedIn account ID.
5. Under **Additional Fields**, set **Schedule At** to the desired publish time (ISO 8601 or a datetime expression).
6. Execute the workflow. The post is created as `scheduled` and will publish at the specified time.

To publish immediately instead of scheduling, set **Publish Now** to `true` under Additional Fields and omit the Schedule At date.

### 2. Auto-reply to new comments via the SocialAPI Trigger

This workflow listens for new comments and posts an automatic reply.

1. Add a **SocialAPI Trigger** node. Select `comment.received` in the **Events** field.
2. (Optional) Set **Account ID Filter** to limit the trigger to a specific connected account.
3. Add an **IF** node. Check `{{ $json.data.is_reply }}` equals `false` to skip replies and avoid loops.
4. On the `true` (non-reply) branch, add a **SocialAPI** node. Set **Resource** to `Comment` and **Operation** to `Reply`.
5. Set **Inbox Post ID** to `{{ $json.data.post_id }}` and **Text** to your automated reply message.
6. Activate the workflow. Each new top-level comment triggers an auto-reply.

Note: activating the workflow registers the webhook with SocialAPI. Your n8n instance must be publicly reachable for delivery to succeed.

### 3. Upload a large video then publish it as a post

This workflow uploads a video file (any size) to SocialAPI storage and then creates a post that includes the video.

1. Add a **Read Binary File** node (or an **HTTP Request** node set to return binary data) to load your video file.
2. Add a **SocialAPI** node. Set **Resource** to `Media` and **Operation** to `Upload`.
   - Set **Source** to `Binary File` and **Input Binary Field** to `data` (or the binary property name from step 1).
   - The node runs the three-step presigned upload: it fetches a presigned URL, PUTs the file directly to storage, and then verifies the upload. The returned item includes a `media_id`.
3. Add a second **SocialAPI** node. Set **Resource** to `Post` and **Operation** to `Create`.
4. Set **Text** to the post caption.
5. Under **Targets**, add the account(s) to publish to.
6. Under **Additional Fields**, set **Media IDs** to `{{ $json.media_id }}` (the ID returned by the Upload step).
7. Set **Publish Now** to `true` to publish immediately, or set **Schedule At** to schedule it.
8. Execute the workflow. The video is uploaded and the post is created with it attached.

## License

MIT. See [LICENSE](LICENSE).

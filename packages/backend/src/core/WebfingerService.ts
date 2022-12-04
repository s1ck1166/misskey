import { URL } from 'node:url';
import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { query as urlQuery } from '@/misc/prelude/url.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';

type ILink = {
	href: string;
	rel?: string;
};

type IWebFinger = {
	links: ILink[];
	subject: string;
};
import { bindThis } from '@/decorators.js';

@Injectable()
export class WebfingerService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		private httpRequestService: HttpRequestService,
	) {
	}

	@bindThis
	public async webfinger(query: string): Promise<IWebFinger> {
		const url = this.genUrl(query);

		return await this.httpRequestService.getJson(url, 'application/jrd+json, application/json') as IWebFinger;
	}

	@bindThis
	private genUrl(query: string): string {
		if (query.match(/^https?:\/\//)) {
			const u = new URL(query);
			return `${u.protocol}//${u.hostname}/.well-known/webfinger?` + urlQuery({ resource: query });
		}

		const m = query.match(/^([^@]+)@(.*)/);
		if (m) {
			const hostname = m[2];
			return `https://${hostname}/.well-known/webfinger?` + urlQuery({ resource: `acct:${query}` });
		}

		throw new Error(`Invalid query (${query})`);
	}
}

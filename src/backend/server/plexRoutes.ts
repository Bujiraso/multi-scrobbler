import { ExpressHandler } from "../common/infrastructure/Atomic";
import { mergeArr, parseBool } from "../utils";
import {ExpressWithAsync} from "@awaitjs/express";
import {Logger} from "@foxxmd/winston";
import ScrobbleSources from "../sources/ScrobbleSources";
import PlexSource, { plexRequestMiddle } from "../sources/PlexSource";
import { PlexNotifier } from "../sources/ingressNotifiers/PlexNotifier";

export const setupPlexRoutes = (app: ExpressWithAsync, logger: Logger, scrobbleSources: ScrobbleSources) => {

    const plexMiddle = plexRequestMiddle();
    const plexLog = logger.child({labels: ['Plex Request']}, mergeArr);
    const plexIngress = new PlexNotifier();
    const plexIngressMiddle: ExpressHandler = async function (req, res, next) {
        // track request before parsing body to ensure we at least log that something is happening
        // (in the event body parsing does not work or request is not POST/PATCH)
        plexIngress.trackIngress(req, true);
        next();
    };
    const plexIngressRoute: ExpressHandler = async function (req, res) {
        plexIngress.trackIngress(req, false);

        const {payload} = req as any;
        if (payload !== undefined) {
            const playObj = PlexSource.formatPlayObj(payload, {newFromSource: true});

            const pSources = scrobbleSources.getByType('plex') as PlexSource[];
            if (pSources.length === 0) {
                plexLog.warn('Received valid Plex webhook payload but no Plex sources are configured');
            }

            for (const source of pSources) {
                await source.handle(playObj);
            }
        }

        res.send('OK');
    };
    app.postAsync('/plex', async function (req, res) {
        res.redirect(307, '/api/plex/ingress');
    });
    app.postAsync('/api/plex/ingress', plexIngressMiddle, plexMiddle, plexIngressRoute);
}


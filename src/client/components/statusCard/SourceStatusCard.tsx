import React, {Fragment, useCallback} from 'react';
import StatusCardSkeleton, {StatusCardSkeletonData} from "./StatusCardSkeleton";
import SkeletonParagraph from "../skeleton/SkeletonParagraph";
import {Link} from "react-router-dom";
import {sourceAdapter} from "../../status/ducks";
import {RootState} from "../../store";
import {connect, ConnectedProps} from "react-redux";
import Player from "../player/Player";
import './statusCard.scss';

export interface SourceStatusCardData extends StatusCardSkeletonData, PropsFromRedux {
    loading?: boolean
}

const statusToStatusType = (status: string) => {
    const lower = status.toLowerCase();
    if(lower.includes('running') || lower.includes('polling') || lower.includes('data')) {
        return 'active';
    }
    if(lower.includes('idle')) {
        return 'warn';
    }
    return 'error';
}

const SourceStatusCard = (props: SourceStatusCardData) => {
    const {
        loading = false,
        data,
        data: {
            display,
            name,
            status,
        } = {}
    } = props;
    let header: string | undefined = display;
    let body = <SkeletonParagraph/>;
    const poll = useCallback(async () => {
        const params = new URLSearchParams({type: data.type, name: data.name});
        await fetch(`/api/poll?${params}`, {
            method: 'GET',
        });
    },[data]);
    if(data !== undefined)
    {
        const {
            display,
            name,
            canPoll,
            hasAuth,
            authed,
            status,
            tracksDiscovered,
            hasAuthInteraction,
            type,
            players = {}
        } = data;
        if(type === 'listenbrainz' || type === 'lastfm') {
            header = `${display} (Source)`;
        }

        const platformIds = Object.keys(players);

        const discovered = (!hasAuth || authed) ? <Link to={`/recent?type=${type}&name=${name}`}>Tracks Discovered</Link> : <span>Tracks Discovered</span>;

        // TODO links
        body = (<div className="statusCardBody">
            {platformIds.map(x => <Player key={x} data={players[x]}/>)}
            <div>{discovered}: {tracksDiscovered}</div>
            {canPoll && hasAuthInteraction ? <a target="_blank" href={`/api/source/auth?name=${name}&type=${type}`}>(Re)authenticate and (re)start polling</a> : null}
            {canPoll && (!hasAuth || authed) ? <div onClick={poll} className="cursor-pointer underline">Restart Polling</div> : null}
        </div>);
    }
    return (
        <StatusCardSkeleton loading={loading} title={header} subtitle={name} status={status} statusType={statusToStatusType(status)}>
                {body}
        </StatusCardSkeleton>
    );
}

const simpleSelectors = sourceAdapter.getSelectors();

const mapStateToProps = (state: RootState, props) => ({
    data: simpleSelectors.selectById(state.sources, props.id)
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(SourceStatusCard);

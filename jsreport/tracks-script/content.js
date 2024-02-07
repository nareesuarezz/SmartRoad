const http = require('http');

function fetchTracks() {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:8080/api/tracks',
            (result) => {
                var str = '';
                result.on('data', (b) => str += b);
                result.on('error', reject);
                result.on('end', () => resolve(JSON.parse(str).map(a => Object({ ...a,
                    lat: a.Location.coordinates[0],
                    lon: a.Location.coordinates[1]
                }))));
            });
    })
}

async function prepareDataSource() {
    const tracks = await fetchTracks();

    const tracksByStatus = tracks.reduce((a, v) => {
        a[v.Status] = a[v.Status] || [];
        a[v.Status].push(v);
        return a;
    }, {});

    const results = Object.keys(tracksByStatus).map((status) => {
        const tracksByStatusGroup = tracksByStatus[status];

        let accumulated = {};

        tracksByStatusGroup.forEach((t) => {
            if (t.Status === 'moving') {
                accumulated[status] += 1;
            } else if (t.Status === 'stopped') {
                accumulated[status] += 1;
            }
        });

        accumulated = {
            moving: tracksByStatus.Moving.length,
            stopped: tracksByStatus.Stopped.length,
        }

        console.log('jjjjjjjjjjjjjjj', tracksByStatus)
        return {
            rows: tracksByStatusGroup,
            group: status,
            accumulated
        };
    });

    return results;
}


async function beforeRender(req, res) {
    req.data.tracks = await prepareDataSource()
}
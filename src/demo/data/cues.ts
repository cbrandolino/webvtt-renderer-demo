export const rawVtt = `WEBVTT 
Region: id=fred width=50% lines=3 regionanchor=50%,100% viewportanchor=30%,90% scroll=up

STYLE
::cue {
  background-image: linear-gradient(to bottom, dimgray, lightgray);
  color: papayawhip;
}

Intro
00:00:00.000 --> 00:00:05.000 align:left line:-10
<b.yellow>Here</b> is an example subtitle...
<00:03.500>hits your eyelalala
lalla

00:00:03.000 --> 00:00:07.000 position: 100% line:0 align:right
And here is another one, positioned differently.

00:00:08.000 --> 00:00:10.000 A:start region:fred
Look! It's a region!

00:00:08.000 --> 00:00:10.000 A:start 
Omg here's another!

Sage
00:00:12.000 --> 00:00:15.000 A:middle T:10%
<v.gatekeeper Gatekeeper>What brings you to the land
of the gatekeepers?

Searching
00:00:18.500 --> 00:00:20.500 A:middle T:80%
<v.sintel>I'm searching for someone.
`;
import { Controller, Get } from '@summer-js/summer'

@Controller('/test')
export class TestController {
  @Get('/html')
  html() {
    return `<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body>

<h1>This is a Heading</h1>
 
Hypertext Markup Language (HTML) is the standard markup language for documents designed to be displayed in a web browser. It defines the content and structure of web content. It is often assisted by technologies such as Cascading Style Sheets (CSS) and scripting languages such as JavaScript.


</body>
</html>
    `
  }

  @Get('/user')
  test() {
    return {
      results: [
        {
          gender: 'female',
          name: {
            title: 'Miss',
            first: 'Kathy',
            last: 'Hunt'
          },
          location: {
            street: {
              number: 4190,
              name: 'Rochestown Road'
            },
            city: 'Kinsealy-Drinan',
            state: 'Cork City',
            country: 'Ireland',
            postcode: 26430,
            coordinates: {
              latitude: '-1.6276',
              longitude: '81.1486'
            },
            timezone: {
              offset: '+5:30',
              description: 'Bombay, Calcutta, Madras, New Delhi'
            }
          },
          email: 'kathy.hunt@example.com',
          login: {
            uuid: '873b6b82-22f7-4ae0-8be9-3e85cf9770ac',
            username: 'purpleduck928',
            password: 'trinity',
            salt: 'i7CO5asR',
            md5: '9c77375de6362db7c0244182ae154e48',
            sha1: 'cfe0d69d222a9bc5e57b77c96cddeab3a365cc63',
            sha256: 'cf0ce824ea841703f53c6b8b0d58eb549f7696aef1245f19123ce838c62de371'
          },
          dob: {
            date: '1976-07-07T18:36:16.255Z',
            age: 48
          },
          registered: {
            date: '2008-11-18T11:41:30.655Z',
            age: 15
          },
          phone: '071-644-0688',
          cell: '081-840-9830',
          id: {
            name: 'PPS',
            value: '7169704T'
          },
          picture: {
            large: 'https://randomuser.me/api/portraits/women/76.jpg',
            medium: 'https://randomuser.me/api/portraits/med/women/76.jpg',
            thumbnail: 'https://randomuser.me/api/portraits/thumb/women/76.jpg'
          },
          nat: 'IE'
        }
      ],
      info: {
        seed: '3f366fbaa893e532',
        results: 1,
        page: 1,
        version: '1.4'
      }
    }
  }
}

import {View, Text} from 'react-native';
import React from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import Fonts from '../../constants/Fonts';

export default function Security() {
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Security & Privacy'} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}>
        <Text style={{fontFamily: Fonts.bold, color: 'black', fontSize: 16}}>
          Undo mask variant polygon
        </Text>
        <Text
          style={{
            fontFamily: Fonts.regular,
            color: 'black',
            fontSize: 14,
            marginVertical: 14,
          }}>
          ShowTrail is an app designed to enhance your consumer show experience,
          helping you discover booths, events, and spot samples. You can enter
          to win prizes, use navigation tools to find your way, and get
          personalized suggestions on where to go next.
        </Text>

        <Text
          style={{
            fontFamily: Fonts.regular,
            color: 'black',
            fontSize: 14,
            marginBottom: 14,
          }}>
          Ipsum fill object hand layer list team device. Pixel outline inspect
          selection scale. Vertical list comment main vertical. Bullet selection
          union horizontal pencil list. Group vector flows flows underline
          invite. Comment inspect bold image align pencil. Distribute export
          bold ellipse ipsum scrolling font scale vector ipsum. Align create
          ellipse italic create inspect content. Bold invite stroke thumbnail
          main arrow. Follower main flatten link community arrange library clip
          scale. Rectangle project fill style follower object select vector
          share. Auto vertical pen auto style editor prototype. Arrow align
          figjam auto background group pixel pixel pixel rotate. Union duplicate
          hand distribute boolean mask pixel figjam ellipse. Group style move
          list blur ipsum slice arrange frame figma. Pen ipsum clip asset
          scrolling share scale object star edit. Move library layout shadow
          pixel. Follower rectangle prototype scale boolean. Font library line
          scale scrolling asset. Flows pencil undo object overflow subtract
          union flatten rectangle. Shadow draft strikethrough link blur figma.
          Ellipse slice star opacity union. Mask fill stroke select.
        </Text>

        <Text
          style={{
            fontFamily: Fonts.regular,
            color: 'black',
            fontSize: 14,
            marginBottom: 14,
          }}>
          Link polygon bold text move outline line slice arrange font. Layout
          star clip shadow list plugin figma. Comment export select ipsum select
          follower bullet figjam style library. Font object thumbnail blur
          scrolling connection horizontal frame distribute distribute. List fill
          create inspect image font. Editor.
        </Text>

        <Text
          style={{
            fontFamily: Fonts.regular,
            color: 'black',
            fontSize: 14,
            marginBottom: 14,
          }}>
          Invite scrolling arrange layout shadow rectangle rectangle inspect
          stroke. Polygon draft create underline share export arrange union
          flatten. Follower font ellipse export pencil main background outline
          object. Bold auto arrange library list clip main. Thumbnail selection
          selection boolean frame. Variant boolean flatten group star community.
          Follower group duplicate undo auto select move project. Layer align
          main select slice shadow shadow. Variant shadow scale export device
          community undo effect. Project prototype text stroke background plugin
          polygon create. Scale pen component variant invite community auto.
        </Text>
      </View>
    </CommonHeaderv2>
  );
}

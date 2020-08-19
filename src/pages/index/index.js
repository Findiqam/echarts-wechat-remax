import React, { useState } from 'react';
import { View, Button, navigateTo, showToast } from 'remax/wechat';
import styles from './index.css';
import { ecTool } from "../../components/ec-canvas";

export default () => {
  const [useGlobalThemes, setUseGlobalThemes] = useState(false);
  return (
    <View className={ styles.app }>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/simple/index'
          })
        } }
      >简单应用</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/setTheme/index'
          })
        } }
      >设置主题</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/lazyload/index'
          })
        } }
      >延迟加载</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/dynamicUpdate/index'
          })
        } }
      >动态改变数据</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/reloadUpdate/index'
          })
        } }
      >销毁重新加载改变数据</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          if (useGlobalThemes) {
            ecTool.setGlobalThemes(null);
            showToast({
              title: '主题<null>',
              icon: 'success',
              duration: 2000
            })
          } else {
            ecTool.setGlobalThemes('biBlue');
            showToast({
              title: '主题<biBlue>',
              icon: 'success',
              duration: 2000
            })
          }
          setUseGlobalThemes(!useGlobalThemes);
        } }
      >设置全局默认主题</Button>
    </View>
  );
};

import React, { useState } from 'react';
import { View, Button, navigateTo, showToast } from 'remax/wechat';
import styles from './index.css';
import { ecTool } from "../../components/ec-canvas";

export default () => {
  const [useGlobalThemes, setUseGlobalThemes] = useState(false);
  const [count, setCount] = useState(0);
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
      >ecTool动态改变数据</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/dynamicUpdateII/index'
          })
        } }
      >通过属性动态改变数据</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/reloadUpdate/index'
          })
        } }
      >销毁-改变数据(ecTool)-重新加载</Button>
      <Button
        className={ styles.buttonBottom }
        onClick={ () => {
          navigateTo({
            url: '/pages/reloadUpdateII/index'
          })
        } }
      >销毁-改变数据(by属性)-重新加载</Button>
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
      <Button
        className={ styles.button }
        onClick={ () => {
          setCount(count + 1);
        } }
      >{ count }</Button>
    </View>
  );
};
